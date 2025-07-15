import type { Request, Response } from 'express'
import { createLogger } from '../../utils/logger';
import { errorParser } from '../../utils/utils';
const logger = createLogger();

const loginPage = async (request: Request, reply: Response) => {
    logger.info('LoginPage Controller initialized')
    try {
        reply.render('login_templates/login.ejs');
    } catch (error) {
        const errorData = await errorParser(error, loginPage.name, 'error');
        logger[errorData.level](errorData.message, errorData);
        reply.status(errorData.code).send(errorData);
    }
}


export { loginPage }