import type { NextFunction, Request, Response } from "express";
import { models } from "../collections";
import { AppError } from "../types/express-error";
import { emitter } from "../utils/emiter";
const { pulseStream } = models


const routerSanity = (request: Request, response: Response, next: NextFunction): void => {
    request.validRoute = true;
    next();
};

const apiHeartBeat = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        emitter.emit('log',{
            msg:`${request.method} ${(new Date()).toLocaleTimeString()} api request --->  ` + request.headers.host || request.hostname + request.baseUrl,
            level:'info'
        })
        fireAndForgetPulse(request);
        next();
    } catch (error) {
        throw (error)
    }
}

function fireAndForgetPulse(request: Request, attempt = 1) {
    if (attempt > 3) {
        const err = new AppError(
            'Pulse Stream error',
            'Max retries reached',
            500,
            fireAndForgetPulse.name,
            request.method,
            'fatal'
        )
        emitter.emit('error', {
            msg: err.message,
            err: err.stack,
            level: err.level,
            code: err.statusCode,
            methodName: err.methodName
        })
        return err;
    }
    pulseStream.create({
        originalUrl: request.headers.host || request.hostname + request.originalUrl,
        url: request.originalUrl,
        host: request.host,
        method: request.method,
    }).catch(err => {
        emitter.emit('error', {
            msg: err.message,
            err: err,
            level: err.level,
            code: 500,
            methodName: fireAndForgetPulse.name
        })
        // Retry with delay
        setTimeout(() => fireAndForgetPulse(request, attempt + 1), 200 * attempt); // Exponential backoff
    });
}


const globalErrorHandler = async (err: AppError, req: Request, res: Response, next: NextFunction) => {
    emitter.emit('error', {
        msg: err.message,
        err: err,
        level: err.level,
        code: err.statusCode,
        methodName: err.methodName
    })
    res.status(err.statusCode).send(err);
}

export { routerSanity, apiHeartBeat, globalErrorHandler };
