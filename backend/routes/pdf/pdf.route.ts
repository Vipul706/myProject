import { Router, type RequestHandler } from "express"
import { generatePdf } from '../../controller/index'
import { AppError } from "../../types/express-error";
import { emitter } from "../../utils/emiter";

const pdfGeneration = async (...middlewares: RequestHandler[]) => {
    try {
        const route = Router()
        route.post('/generate-pdf', ...middlewares, generatePdf);
        emitter.emit('log', {
            msg: 'Pdf Request Route Initialized',
            level: 'info'
        })
        return route;
    } catch (error: any) {
        let err = new AppError(error.stack, error.message, 500, pdfGeneration.name, error.name)
        throw (err)
    }
}

export { pdfGeneration }