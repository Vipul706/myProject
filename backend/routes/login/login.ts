import { Router } from "express"
import type { RequestHandler } from "express-serve-static-core";
import { accessController, forgotPasswordController, loginPage } from "../../controller";
import { AppError } from "../../types/express-error";
import { emitter } from "../../utils/emiter";


//TODO:: Create Reset Password Route
const loginRoutes = async (...middlewares: RequestHandler[]) => {
    try {
        const route = Router()
        route.get('/', ...middlewares, loginPage);
        route.post('/access', ...middlewares, accessController)
        route.post('/forgotPassword', ...middlewares, forgotPasswordController)
        emitter.emit('log', {
            msg: 'Cv Request Route Initialized',
            level: 'info'
        })
        return route;
    } catch (error: any) {
        let err = new AppError(error.stack, error.message, 500, loginRoutes.name, error.name)
        throw (err)
    }
}

export { loginRoutes }