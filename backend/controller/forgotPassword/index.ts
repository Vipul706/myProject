import type { Request, Response } from 'express'
import { hForgotPassword } from './helper';
import { errorGenerator } from '../../utils/utils';
import { emitter } from '../../utils/emiter';
import { AppError } from '../../types/express-error';
import type { forgotPassword } from './types';

const forgotPasswordController = async (request: Request, reply: Response) => {
    emitter.emit('log', {
        msg: 'ForgotPassword Controller initialized',
        level: 'info'
    })
    try {
        const res = await hForgotPassword(request.body as forgotPassword)
        const { errorCode, statusCode } = res
        if (errorCode !== 'NO_ERROR') {
            throw errorGenerator(errorCode, errorCode, statusCode, 'error', forgotPasswordController.name, "None");
        }
        reply.status(statusCode).json({ errorCode: errorCode, statusCode: statusCode })
    } catch (error: any) {
        error = await error
        const err = new AppError(error.stack, error.message, 500, forgotPasswordController.name, 'Server Error');
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



export { forgotPasswordController }