import EventEmitter from "events";
import { logger } from "./logger";
import type { ErrorLogData, EventsMap, logData } from "../types/types";
import { errorGenerator, errorParser } from "./utils";
import { env } from "../config/envconfig";

class TypedEmitter extends EventEmitter {
    override on<K extends keyof EventsMap>(event: K, listener: EventsMap[K]): this {
        return super.on(event, listener);
    }

    override emit<K extends keyof EventsMap>(event: K, ...args: Parameters<EventsMap[K]>): boolean {
        return super.emit(event, ...args);
    }
}

const emitter = new TypedEmitter();

export const errorListener = async (logData: ErrorLogData) => {
    const { message, name } = logData.err;
    const err = await errorGenerator(
        name,
        message,
        logData.code,
        logData.level,
        logData.methodName,
        logData.err.stack
    );
    const error = await errorParser(err, err.methodName);
    logger[error.level](`🧨 Emitter Log: Anomaly flagged in ${error.method}`, error);
    return error;
};

export const logListener = (log: logData) => {
    logger[log.level](`🎯 Intel Drop → "${log.msg}" [Severity: ${log.level}]`);
};

const eventHandlers = {
    log: logListener,
    error: errorListener
} as const;

const eventTurnOn = () => {
    (Object.keys(eventHandlers) as (keyof typeof eventHandlers)[]).forEach((key) => {
        emitter.on(key, eventHandlers[key]);
    });
};

const eventTurnOff = () => {
    for (const key in eventHandlers) {
        emitter.off(key, eventHandlers[key as keyof typeof eventHandlers]);
    }
};

const centralLoggingEmitter = async () => {
    try {
        if (env.pro_env !== 'production') {
            logger.info('Centeral Logger Initialize')
            eventTurnOn();
        }
    } catch (error: any) {
        const err = await errorListener({
            err: error,
            level: 'error',
            code: 500,
            methodName: centralLoggingEmitter.name,
            msg: error.message
        });
        throw err;
    }
};

export { centralLoggingEmitter, emitter, eventTurnOff };
