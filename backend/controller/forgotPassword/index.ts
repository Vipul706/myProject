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
        const res = await hForgotPassword(request, request.body as forgotPassword)
        const { errorCode, statusCode } = res
        if (errorCode !== 'NO_ERROR') {
            throw await errorGenerator(errorCode, errorCode, statusCode, 'error', forgotPasswordController.name, "None");
        }
        reply.status(statusCode).json({ errorCode: errorCode, statusCode: statusCode })
    } catch (e: any) {
        const error = e as AppError;
        const orgError = new AppError(error.stack, error.message, 500, forgotPasswordController.name,error.message?error.message: 'Server Error');
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



export { forgotPasswordController }