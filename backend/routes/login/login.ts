import { Router } from "express"
import type { RequestHandler } from "express-serve-static-core";
import { createLogger } from "../../utils/logger";
import { accessController, loginPage } from "../../controller";
import { AppError } from "../../types/express-error";


const logger = createLogger();

const loginRoutes = async (...middlewares: RequestHandler[]) => {
    try {
        const route = Router()
        route.get('/', ...middlewares, loginPage);
        route.post('/access', ...middlewares, accessController)

        logger.info('Cv Request Route Initialized')
        return route;
    } catch (error:any) {
        let err = new AppError(error.message, 500, loginRoutes.name, error.name)
        throw (err)
    }
}

export { loginRoutes }