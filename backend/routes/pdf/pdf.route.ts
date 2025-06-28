import { Router, type RequestHandler, type Response } from "express"
import { generatePdf } from '../../controller/index'
import { createLogger } from "../../utils/logger";

const logger = createLogger();

const pdfGeneration = (...middlewares: RequestHandler[]) => {
    const route = Router()
    route.post('/generate-pdf', ...middlewares, generatePdf);

    logger.info('Pdf Request Route Initialized')
    return route;
}

export { pdfGeneration }