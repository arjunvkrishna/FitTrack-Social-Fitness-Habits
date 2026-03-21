import axios from 'axios';
import User from '../models/User';
import SystemSettings from '../models/SystemSettings';
import { logger } from '../utils/logger';

export const initTelegramScheduler = () => {
    logger.info('Initializing Telegram water reminder scheduler...');
    
    // Check every 15 minutes
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

                logger.info(`Sending water reminders to ${users.length} users...`);

                for (const user of users) {
                    try {
                        await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                            chat_id: user.telegramChatId,
                            text: `Hey ${user.name}! 💧 Time for a water break. Stay hydrated! (Goal: ${user.waterGoal}ml)`
                        });
                    } catch (err: any) {
                        logger.error(`Failed to send Telegram message to ${user.username}:`, err.response?.data || err.message);
                    }
                }
            }
        } catch (err) {
            logger.error('Error in Telegram scheduler loop:', err);
        }
    }, 15 * 60 * 1000); 
};
