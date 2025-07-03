import { Router } from "express"
import type { RequestHandler } from "express-serve-static-core";
import { createLogger } from "../../utils/logger";
import { loginPage } from "../../controller";


const logger = createLogger();

const loginRoutes = (...middlewares: RequestHandler[]) => {
    const route = Router()
    route.get('/', ...middlewares, loginPage);

    logger.info('Cv Request Route Initialized')
    return route;
}

export { loginRoutes }