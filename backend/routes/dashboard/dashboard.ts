import { Router } from "express"
import type { RequestHandler } from "express-serve-static-core";
import { AppError } from "../../types/express-error";
import { emitter } from "../../utils/emiter";
import { dashboardPage } from "../../controller/dashboard";



const dashboardRoutes = async (...middlewares: RequestHandler[]) => {
    try {
        const route = Router()
        route.get('/', ...middlewares, dashboardPage);
        emitter.emit('log', {
            msg: 'Cv Request Route Initialized',
            level: 'info'
        })
        return route;
    } catch (e: any) {
        const error = e as AppError;
        const orgError = new AppError(error, error.stack, error.message, 500, dashboardRoutes.name, 'Server Error');
        throw (orgError)
    }
}

export { dashboardRoutes }