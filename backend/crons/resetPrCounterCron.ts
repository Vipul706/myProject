import cron, { type ScheduledTask } from 'node-cron';
import { emitter } from '../utils/emiter';
import { AppError } from '../types/express-error';
import { getMongooseModel } from '../utils/utils';

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
        const UserVault = getMongooseModel('UserVault')  // ✅ THIS is key

        if (!UserVault) {
            emitter.emit('error', {
                msg: '[CRON] UserVault model is undefined!',
                level: 'fatal',
                methodName: 'resetPrCounterCron',
                code: 500,
                stack: 'error'
            });
            return;
        }

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
        } catch (e: any) {
            const error = e as AppError;
            const orgError = new AppError(error.stack, error.message, 500, resetPrCounterCron.name, 'Server Error');
            emitter.emit('error', {
                msg: '[CRON] resetPrCounterCron failed.',
                level: 'fatal',
                code: 500,
                methodName: 'resetPrCounterCron',
                stack: orgError.stack!
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
