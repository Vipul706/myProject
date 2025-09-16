import type { Request, Response } from 'express'
import { emitter } from '../../utils/emiter';
import { AppError } from '../../types/express-error';

const dashboardPage = async (_request:Request,reply: Response) => {
    emitter.emit('log', {
        msg: 'Dashboard Controller initialized',
        level: 'info'
    })
    try {
        reply.render('dashboard/dashboard.ejs');
    } catch (e: any) {
        const error = e as AppError;
       const orgError = new AppError(error.stack, error.message, 500, dashboardPage.name, 'Server Error');
        emitter.emit('error', {
            msg: orgError.message,
            stack:orgError.stack!,
            level: orgError.level,
            code: error.statusCode,
            methodName: error.methodName
        });
         reply.status(500).send({errorCode:orgError.message,status:orgError.statusCode,error:orgError});
    }
}


export { dashboardPage }