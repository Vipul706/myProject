import { Router } from "express"
import type { RequestHandler } from "express-serve-static-core";
import { AppError } from "../../types/express-error";
import { emitter } from "../../utils/emiter";
import { cvAddData,dashboardPage } from "../../controller";



const dashboardRoutes = async (...middlewares: RequestHandler[]) => {
    try {
        const route = Router()
        route.get('/', ...middlewares, dashboardPage);
        route.post('/addCvdata', ...middlewares, cvAddData);
        emitter.emit('log', {
            msg: 'dashboard Request Route Initialized',
            level: 'info'
        })
        return route;
    } catch (e: any) {
        const error = e as AppError;
        const orgError = new AppError(error.stack, error.message, 500, dashboardRoutes.name, 'Server Error');
        throw (orgError)
    }
}

export { dashboardRoutes }