import type { Request, Response } from 'express'
import { createLogger } from '../../utils/logger';
import { hLogin } from './helper';
import { errorGenerator, errorParser } from '../../utils/utils';
const logger = createLogger();

const accessController = async (request: Request, reply: Response) => {
    logger.info('Login Controller initialized')
    try {
        const authToken = request.headers['token'] as string
        console.log(authToken);
        
        const res = await hLogin(request.body,authToken)
        const { errorCode, code, token } = res
        if (errorCode !== 'NO_ERROR') {
            throw errorGenerator(errorCode, errorCode, code, 'error', accessController.name);
        }
        reply.setHeader('token', token!)
        reply.status(code).send('hello')
    } catch (error) {
        const errorData = await errorParser(error, accessController.name, 'error');
        logger[errorData.level](errorData.message, errorData);
        reply.status(errorData.code).send(errorData);
    }
}



export { accessController }