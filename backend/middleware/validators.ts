import type { NextFunction, Request, Response } from "express";
import { models } from "../collections";
import { AppError } from "../types/express-error";
import { emitter } from "../utils/emiter";
const { pulseStream } = models


const routerSanity = (request: Request, _response: Response, next: NextFunction): void => {
    request.validRoute = true;
    next();
};

// TODO:: Store IP address and Throw Error without Ip 
const apiHeartBeat = async (request: Request, _response: Response, next: NextFunction): Promise<void> => {
    try {
        const region = Intl.DateTimeFormat().resolvedOptions().timeZone
        emitter.emit('log', {
            msg: `In Region: ${region} ${request.method} ${(new Date()).toLocaleTimeString()} api request --->  ` + request.headers.host || request.hostname + request.baseUrl,
            level: 'info'
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
            methodName: err.methodName,
            stack: err.methodName
        })
        return err;
    }
    pulseStream.create({
        originalUrl: request.headers.host || request.hostname + request.originalUrl,
        url: request.originalUrl,
        host: request.host,
        region: Intl.DateTimeFormat().resolvedOptions().timeZone,
        method: request.method,
    }).catch(e => {
        const error = e as AppError;
        const orgError = new AppError(error.stack, error.message, 500, fireAndForgetPulse.name, 'Server Error');
        emitter.emit('error', {
            msg: orgError.message,
            stack: orgError.stack!,
            level: orgError.level,
            code: error.statusCode,
            methodName: error.methodName
        });
        // Retry with delay
        setTimeout(() => fireAndForgetPulse(request, attempt + 1), 200 * attempt); // Exponential backoff
    });
}


const globalErrorHandler = async (err: AppError, _req: Request, res: Response, _next: NextFunction) => {
    const errorObj = {
        msg: err.message || "Server Error on GlobalErrorHandler",
        err: err,
        level: err.level,
        code: err.statusCode || 500,
        methodName: err.methodName || globalErrorHandler.name,
        stack:err.stack!
    }
    emitter.emit('error', errorObj)
    res.status(err.statusCode).send(err);
}

export { routerSanity, apiHeartBeat, globalErrorHandler };
