import { Router } from "express"
import type { RequestHandler } from "express-serve-static-core";
import { getCvTemp } from '../../controller/index'
import { createLogger } from "../../utils/logger";


const logger = createLogger();

const cvTemplatesRoutes = (...middlewares: RequestHandler[]) => {
    try {
        const route = Router()
        route.get('/', ...middlewares, getCvTemp);
        logger.info('Cv Request Route Initialized')
        return route;
    } catch (error) {
        throw (error)
    }
}

export { cvTemplatesRoutes }