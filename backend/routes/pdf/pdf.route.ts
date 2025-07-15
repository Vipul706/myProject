import { Router, type RequestHandler } from "express"
import { generatePdf } from '../../controller/index'
import { createLogger } from "../../utils/logger";
import { AppError } from "../../types/express-error";

const logger = createLogger();

const pdfGeneration = async (...middlewares: RequestHandler[]) => {
    try {
        const route = Router()
        route.post('/generate-pdf', ...middlewares, generatePdf);

        logger.info('Pdf Request Route Initialized')
        return route;
    } catch (error: any) {
        let err = new AppError(error.message, 500, pdfGeneration.name, error.name)
        throw (err)
    }
}

export { pdfGeneration }