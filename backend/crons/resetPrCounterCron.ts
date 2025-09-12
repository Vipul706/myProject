import { models, Model } from 'mongoose';
import cron, { type ScheduledTask } from 'node-cron';
import type { IUserDocument } from '../types/model.type';
import { emitter } from '../utils/emiter';

const UserVault = models['UserVault'] as Model<IUserDocument>;

// Store the cron instance so it can be stopped later
let resetPrCronTask: ScheduledTask | null = null;

/**
 * Starts the password reset counter cron job
 * @param cronTime - Cron expression (e.g., '0 * * * *')
 */
export const resetPrCounterCron = (cronTime: string) => {
    if (resetPrCronTask) {
        emitter.emit('log', {
            msg: '[CRON] resetPrCounterCron is already running.',
            level: 'info'
        });
        return;
    }

    resetPrCronTask = cron.schedule(cronTime, async () => {
        const now = new Date();
        const cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

        try {
            const result = await UserVault.updateMany(
                {
                    lastPasswordResetAt: { $lt: cutoffTime },
                    prCounter: { $ne: 0 }
                },
                {
                    $set: { prCounter: 0 }
                }
            );

            emitter.emit('log', {
                msg: `[CRON] resetPrCounterCron executed. Modified ${result.modifiedCount} users.`,
                level: 'info'
            });
        } catch (error: any) {
            emitter.emit('error', {
                msg: '[CRON] resetPrCounterCron failed.',
                err: error,
                level: 'error',
                code: 500,
                methodName: 'resetPrCounterCron'
            });
        }
    });

    emitter.emit('log', {
        msg: `[CRON] resetPrCounterCron has been scheduled with cronTime "${cronTime}".`,
        level: 'info'
    });
};


export const stopResetPrCounterCron = () => {
    if (resetPrCronTask) {
        resetPrCronTask.stop();
        resetPrCronTask = null;

        emitter.emit('log', {
            msg: '[CRON] resetPrCounterCron has been stopped.',
            level: 'info'
        });
    } else {
        emitter.emit('log', {
            msg: '[CRON] resetPrCounterCron is not currently running.',
            level: 'info'
        });
    }
};
