import { Router, type Request, type Response } from "express"
import { createLogger } from "../../utils/utils";
import type { RequestHandler, ParamsDictionary } from "express-serve-static-core";
import { getCvTemp } from '../../controller/index'


const logger = createLogger();

const cvTemplatesRoutes = (...middlewares: RequestHandler[]) => {
    const route = Router()
    route.get('/', ...middlewares, getCvTemp);

    logger.debug('Cv Request Route Initialized')
    return route;
}

export { cvTemplatesRoutes }