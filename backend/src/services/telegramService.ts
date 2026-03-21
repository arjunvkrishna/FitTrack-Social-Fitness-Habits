import axios from 'axios';
import User from '../models/User';
import SystemSettings from '../models/SystemSettings';
import { logger } from '../utils/logger';

export const initTelegramScheduler = () => {
    logger.info('Initializing Telegram water reminder scheduler...');
    
    // Check every 1 minute
    setInterval(async () => {
        try {
            const now = new Date();
            const hour = now.getHours();

            // Only send between 7 AM and 10 PM
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
