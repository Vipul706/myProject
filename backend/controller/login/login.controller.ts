import type { Request, Response } from 'express'
import { hLogin } from './helper';
import { errorGenerator } from '../../utils/utils';
import { emitter } from '../../utils/emiter';

const accessController = async (request: Request, reply: Response) => {
    emitter.emit('log', {
        msg: 'Login Controller initialized',
        level: 'info'
    })
    try {
        const authToken = request.headers['token'] as string
        const res = await hLogin(request.body, authToken)
        const { errorCode, statusCode, token } = res
        if (errorCode !== 'NO_ERROR') {
            throw errorGenerator(errorCode, errorCode, statusCode, 'error', accessController.name, "None");
        }
        reply.setHeader('token', token!)
        reply.status(statusCode).send('hello')
    } catch (error: any) {
        emitter.emit('error', {
            msg: error.message,
            err: error,
            level: error.level,
            code: error.statusCode,
            methodName: error.methodName
        })
        reply.status(error.code).send(error);
    }
}



export { accessController }