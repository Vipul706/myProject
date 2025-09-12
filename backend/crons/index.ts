// crons/index.ts

import { resetPrCounterCron, stopResetPrCounterCron } from './resetPrCounterCron';
import { emitter } from '../utils/emiter'; // adjust path

type CronRegistration = {
    name: string;
    cronTime: string;
    start: (cronTime: string) => void;
    stop: () => void;
};


const cronJobs: CronRegistration[] = [
    {
        name: 'Reset Password Reset Counter Cron',
        cronTime: '0 * * * *', // 👈 defined once
        start: resetPrCounterCron,
        stop: stopResetPrCounterCron
    }
];

const registerCrons = () => {
    for (const cron of cronJobs) {
        cron.start(cron.cronTime); // ✅ use the dynamic cronTime
        emitter.emit('log', {
            msg: `[CRON] Registered and started: ${cron.name} (${cron.cronTime})`,
            level: 'info'
        });
    }
};

const stopCrons = () => {
    for (const cron of cronJobs) {
        cron.stop();
        emitter.emit('log', {
            msg: `[CRON] Stopped: ${cron.name}`,
            level: 'info'
        });
    }
};

export {
    stopCrons,
    registerCrons
}