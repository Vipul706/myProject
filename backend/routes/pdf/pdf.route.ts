import { Router, type NextFunction, type Request, type RequestHandler, type Response } from "express"
import { createLogger } from "../../utils/utils";
import { generatePdf } from '../../controller/index'

const logger = createLogger();

const pdfGeneration = (...middlewares: RequestHandler[]) => {
    const route = Router()
    route.post('/generate-pdf', ...middlewares, generatePdf);

    logger.debug('Pdf Request Route Initialized')
    return route;
}

export { pdfGeneration }