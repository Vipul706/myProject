import { AppError } from "../../types/express-error";
import { emitter } from "../../utils/emiter";
import type { Request, Response } from 'express'
import { errorGenerator } from "../../utils/utils";
import { hAddCvData } from "./helper";
import type { AddCvDataRequest, helperType } from "./types";

const cvAddData = async (request: Request, reply: Response) => {
    emitter.emit('log', {
        msg: 'Add CV Data Controller initialized',
        level: 'info'
    })
    try {
        const cvDataObj:AddCvDataRequest = {
            ...request.body,
            email: request.email
        }
        const res = await hAddCvData(cvDataObj) as helperType
        const { errorCode, statusCode } = res
        if (errorCode !== 'NO_ERROR') {
            throw errorGenerator(errorCode, errorCode, statusCode, 'error', cvAddData.name, "None");
        }
        reply.status(statusCode).json({ errorCode: errorCode, statusCode: statusCode })
    } catch (e: any) {
        const error = e as AppError;
        const orgError = new AppError(error.stack, error.message, 500, cvAddData.name, 'Server Error');
        emitter.emit('error', {
            msg: orgError.message,
            stack: orgError.stack!,
            level: orgError.level,
            code: error.statusCode,
            methodName: error.methodName
        });
        reply.status(500).send({ errorCode: orgError.message, status: orgError.statusCode, error: orgError });
    }
}

export {
    cvAddData
}

