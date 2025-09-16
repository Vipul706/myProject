import { type Request, type Response } from 'express'
import { errorGenerator } from '../../utils/utils';
import { hCvTemplate } from './helper';
import { emitter } from '../../utils/emiter';
import { AppError } from '../../types/express-error';



const getCvTemp = async (_request: Request, reply: Response) => {
    emitter.emit('log', {
        msg: 'Cv Controller initialized',
        level: 'info'
    })
    try {
        const res = await hCvTemplate()
        const { errorCode, code, data, userData } = res
        if (errorCode !== 'NO_ERROR') {
            throw await errorGenerator(errorCode, errorCode, code, 'error', getCvTemp.name, 'None');
        }
        reply.render('cv_templates/cv.ejs', {
            data: {
                userData: userData,
                cvData: data
            }
        });
    } catch (e: any) {
        const error = e as AppError;
        const orgError = new AppError(error.stack, error.message, 500, getCvTemp.name, 'Server Error');
        emitter.emit('error', {
            msg: orgError.message,
            stack: orgError.stack!,
            level: orgError.level,
            code: error.statusCode,
            methodName: error.methodName
        });

        reply.status(500).send({ errorCode: orgError.message, status: orgError.statusCode, error: orgError });
    }
};

export { getCvTemp }
