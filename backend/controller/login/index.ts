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
    } catch (error: any) {
        error = await error
        const err = new AppError(error.stack, error.message, 500, accessController.name, 'Server Error');
        emitter.emit('error', {
            msg: err.message,
            err: err,
            level: err.level,
            code: err.statusCode,
            methodName: err.methodName
        })
        reply.status(err.statusCode).send(err);
    }
}



export { accessController }