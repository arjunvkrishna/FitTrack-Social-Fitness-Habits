import axios from 'axios';
import User from '../models/User';
import SystemSettings from '../models/SystemSettings';
import { logger } from '../utils/logger';

function isCurrentTimeInWindow(start: string, end: string): boolean {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const [startH, startM] = start.split(':').map(Number);
    const startMinutes = (startH || 0) * 60 + (startM || 0);
    
    const [endH, endM] = end.split(':').map(Number);
    const endMinutes = (endH || 0) * 60 + (endM || 0);
    
    if (startMinutes <= endMinutes) {
        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
        // Over midnight (e.g., 22:00 to 07:00)
        return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
}

export const initTelegramScheduler = () => {
    logger.info('Initializing Telegram water reminder scheduler...');
    
    // Check every 1 minute
    setInterval(async () => {
        try {
            const now = new Date();
            const hour = now.getHours();

            // Background operational hours: 7 AM to 10 PM
            if (hour >= 7 && hour <= 22) {
                const botTokenSetting = await SystemSettings.findOne({ key: 'telegramBotToken' });
                const botToken = botTokenSetting?.value;

                if (!botToken) {
                    logger.warn('Telegram Bot Token not configured in SystemSettings');
                    return;
                }

                const users = await User.find({ 
                    telegramChatId: { $exists: true, $ne: '' },
                    isActive: true 
                });

                for (const user of users) {
                    try {
                        // Check DND status
                        if (user.dndEnabled && user.dndStart && user.dndEnd) {
                            if (isCurrentTimeInWindow(user.dndStart, user.dndEnd)) {
                                continue; // Skip this user during DND
                            }
                        }

                        const frequencyMinutes = user.reminderFrequency || 60;
                        const lastSentTime = user.lastReminderSent ? new Date(user.lastReminderSent).getTime() : 0;
                        const nextReminderTime = lastSentTime + (frequencyMinutes * 60 * 1000);

                        if (now.getTime() >= nextReminderTime) {
                            await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                                chat_id: user.telegramChatId,
                                text: `Hey ${user.name}! 💧 Time for a water break. Stay hydrated! (Goal: ${user.waterGoal}ml)`
                            });

                            // Update lastReminderSent
                            user.lastReminderSent = now;
                            await user.save();
                            logger.info(`Sent water reminder to ${user.username} (Frequency: ${frequencyMinutes}m)`);
                        }
                    } catch (err: any) {
                        logger.error(`Failed to send Telegram message to ${user.username}:`, err.response?.data || err.message);
                    }
                }
            }
        } catch (err) {
            logger.error('Error in Telegram scheduler loop:', err);
        }
    }, 1 * 60 * 1000); 
};
