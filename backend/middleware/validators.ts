import type { NextFunction, Request, Response } from "express";
import { createLogger } from "../utils/logger";
import { models } from "../collections";
import { errorParser } from "../utils/utils";

const { pulseStream } = models

const logger = createLogger();

const routerSanity = (request: Request, response: Response, next: NextFunction): void => {
    request.validRoute = true;
    next();
};

const apiHeartBeat = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${request.method} ${(new Date()).toLocaleTimeString()} api request --->  ` + request.headers.host || request.hostname + request.baseUrl)
        pulseStream.create({
            originalUrl: request.headers.host || request.hostname + request.originalUrl,
            url: request.originalUrl,
            host: request.host,
            method: request.method,
        }).catch((err: unknown) => logger.fatal('Pulse Stream error', errorParser(err, request.method, 'fatal')))
        next();
    } catch (error) {
        throw (error)
    }
}

export { routerSanity, apiHeartBeat };
