import { Router } from "express"
import type { RequestHandler } from "express-serve-static-core";
import { getCvTemp } from '../../controller/index'
import { AppError } from "../../types/express-error";
import { emitter } from "../../utils/emiter";



const cvTemplatesRoutes = async (...middlewares: RequestHandler[]) => {
    try {
        const route = Router()
        route.get('/', ...middlewares, getCvTemp);
        emitter.emit('log', {
            msg: `Cv Request Route Initialized`,
            level: 'info'
        })
        return route;
    } catch (error: any) {
        let err = new AppError(error.stack, error.message, 500, cvTemplatesRoutes.name, error.name)
        throw (err)
    }
}

export { cvTemplatesRoutes }