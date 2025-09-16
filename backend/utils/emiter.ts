import EventEmitter from "events";
import { logger } from "./logger";
import type { EventsMap } from "../types/types";
import { env } from "../config/envconfig";
import { logListener, errorListener } from "./eventListerners";
import { stopCrons } from "../crons";
import { AppError } from "../types/express-error";

class TypedEmitter extends EventEmitter {
    override on<K extends keyof EventsMap>(event: K, listener: EventsMap[K]): this {
        return super.on(event, listener);
    }

    override emit<K extends keyof EventsMap>(event: K, ...args: Parameters<EventsMap[K]>): boolean {
        return super.emit(event, ...args);
    }
}

const emitter = new TypedEmitter();

const eventHandlers = {
    log: logListener,
    error: errorListener
} as const;

const toggleEmitter = (action: "on" | "off") => {
    (Object.keys(eventHandlers) as (keyof typeof eventHandlers)[]).forEach((key) => {
        if (action === 'on') {
            emitter.on(key, eventHandlers[key]); // safely typed
        } else {
            stopCrons()
            emitter.off(key, eventHandlers[key]); // safely typed
        }
    })
}

const centralLoggingEmitter = async () => {
    try {
        if (env.pro_env !== 'production') {
            logger.info('🎯 Centeral Logger Initialize')
            toggleEmitter('on');
        }
    } catch (e: any) {
        const error = e as AppError;
        const orgError = new AppError(error.stack, error.message, 500, centralLoggingEmitter.name, 'Server Error');
        emitter.emit('error', {
            msg: orgError.message,
            stack: orgError.stack!,
            level: orgError.level,
            code: error.statusCode,
            methodName: error.methodName
        });

        throw orgError;
    }
};

export { centralLoggingEmitter, emitter, toggleEmitter };
