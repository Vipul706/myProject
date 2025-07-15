import { Router } from "express"
import type { RequestHandler } from "express-serve-static-core";
import { getCvTemp } from '../../controller/index'
import { createLogger } from "../../utils/logger";
import { errorParser } from "../../utils/utils";
import { AppError } from "../../types/express-error";


const logger = createLogger();

const cvTemplatesRoutes = async (...middlewares: RequestHandler[]) => {
    try {
        const route = Router()
        route.get('/', ...middlewares, getCvTemp);
        logger.info('Cv Request Route Initialized')
        return route;
    } catch (error: any) {
        let err = new AppError(error.message, 500, cvTemplatesRoutes.name, error.name)
        throw (err)
    }
}

export { cvTemplatesRoutes }