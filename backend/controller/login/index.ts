import type { Request, Response } from 'express'
import { hLogin } from './helper';
import { errorGenerator } from '../../utils/utils';
import { emitter } from '../../utils/emiter';
import { AppError } from '../../types/express-error';
import { env } from '../../config/envconfig';
import type { login } from './types';

const accessController = async (request: Request, reply: Response) => {
    emitter.emit('log', {
        msg: 'Login Controller initialized',
        level: 'info'
    })
    try {
        const res = await hLogin(request.body as login)
        const { errorCode, statusCode, token } = res
        if (errorCode !== 'NO_ERROR') {
            throw errorGenerator(errorCode, errorCode, statusCode, 'error', accessController.name, "None");
        }
        reply.setHeader('token', token!)
        reply.status(statusCode).json({ errorCode: errorCode, statusCode: statusCode, redirectUrl: env.loginDashboardUrl })
    } catch (e: any) {
        const error = e as AppError;
        const orgError = new AppError(error.stack, error.message, 500, accessController.name, 'Server Error');
        emitter.emit('error', {
            msg: orgError.message,
            stack: orgError.stack!,
            level: orgError.level,
            code: error.statusCode,
            methodName: error.methodName
        });
         reply.status(500).send({errorCode:orgError.message,status:orgError.statusCode,error:orgError});
    }
}



export { accessController }