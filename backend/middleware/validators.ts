import type { NextFunction, Request, Response } from "express";
import { createLogger } from "../utils/utils";
const logger = createLogger();

const routerSanity = (request: Request, response: Response, next: NextFunction): void => {
    request.validRoute = true;
    logger.info('Request Data ', request.validRoute)
    next();
};

const apiHeartBeat = (request: Request, response: Response, next: NextFunction): void => {
    logger.info(`${request.method} api request --->  ` + request.host + request.baseUrl)
    next();
}

export { routerSanity, apiHeartBeat };
