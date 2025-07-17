import { json, type Request, type Response } from 'express'
import { errorGenerator, errorParser } from '../../utils/utils';
import { hCvTemplate } from './helper';
import { emitter } from '../../utils/emiter';



const getCvTemp = async (request: Request, reply: Response) => {
    emitter.emit('log', {
        msg: 'Cv Controller initialized',
        level: 'info'
    })
    try {
        const res = await hCvTemplate()
        const { errorCode, code, data } = res
        if (errorCode !== 'NO_ERROR') {
            throw await errorGenerator(errorCode, errorCode, code, 'error', getCvTemp.name, 'None');
        }
        reply.render('cv_templates/cv.ejs', { data: data });
    } catch (error: any) {
        emitter.emit('error', {
            msg: error.message,
            err: error,
            level: error.level,
            code: error.statusCode,
            methodName: error.methodName
        })
        reply.status(error.statusCode).send(error);
    }
};

export { getCvTemp }
