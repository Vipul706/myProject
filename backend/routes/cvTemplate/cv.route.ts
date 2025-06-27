import { Router,  type Request, type Response } from "express"
import { createLogger } from "../../utils/utils";
import type { RequestHandler, ParamsDictionary } from "express-serve-static-core";
const logger = createLogger();

const cvTemplatesRoutes = (...middlewares: RequestHandler[]) => {
    const route = Router()
    route.get('/',...middlewares, (req: Request, res: Response) => {
        res.render('cv.ejs');
    });
    logger.debug('Request Route Initialized')
    return route;
}

export  {cvTemplatesRoutes}