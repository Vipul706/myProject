import { Router } from "express"
import type { RequestHandler } from "express-serve-static-core";
import { accessController, forgotPasswordController, loginPage, resetPassword } from "../../controller";
import { AppError } from "../../types/express-error";
import { emitter } from "../../utils/emiter";


//TODO:: Create Joi Validation for the apis
const loginRoutes = async (...middlewares: RequestHandler[]) => {
    try {
        const route = Router()
        route.get('/', ...middlewares, loginPage);
        route.post('/access', ...middlewares, accessController)
        route.post('/forgotPassword', ...middlewares, forgotPasswordController)
        route.get('/resetPassword', ...middlewares, resetPassword)
        emitter.emit('log', {
            msg: 'Cv Request Route Initialized',
            level: 'info'
        })
        return route;
    } catch (error: any) {
        const errObj = error as Error;
        const err = new AppError(
            errObj.stack ?? "No stack",
            errObj.message ?? "Unknown error",
            500,
            loginRoutes.name,
            errObj.name ?? "UnknownError"
        );
        throw (err)
    }
}

export { loginRoutes }