import { Router, type Request, type Response } from "express"
import type { RequestHandler, ParamsDictionary } from "express-serve-static-core";
import { getCvTemp } from '../../controller/index'
import { createLogger } from "../../utils/logger";


const logger = createLogger();

const cvTemplatesRoutes = (...middlewares: RequestHandler[]) => {
    const route = Router()
    route.get('/', ...middlewares, getCvTemp);
     
    logger.info('Cv Request Route Initialized')
    return route;
}

export { cvTemplatesRoutes }