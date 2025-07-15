import type { Request, Response } from 'express'
import { createLogger } from '../../utils/logger';
import { errorGenerator, errorParser } from '../../utils/utils';
import { hCvTemplate } from './helper';

const logger = createLogger();


const getCvTemp = async (request: Request, reply: Response) => {
    logger.info('Cv Controller initialized')
    try {
        const res = await hCvTemplate()
        const { errorCode, code, data } = res
        if (errorCode !== 'NO_ERROR') {
            throw errorGenerator(errorCode, errorCode, code, 'error', getCvTemp.name);
        }
        reply.render('cv_templates/cv.ejs', { data: data });
    } catch (error) {
        const errorData = await errorParser(error, getCvTemp.name, 'error');
        logger[errorData.level](errorData.message, errorData);
        reply.status(errorData.code).send(errorData);
    }
};

export { getCvTemp }