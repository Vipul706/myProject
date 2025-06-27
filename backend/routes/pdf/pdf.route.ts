import { Router, type NextFunction, type Request, type RequestHandler, type Response } from "express"
import { createLogger, errorParser } from "../../utils/utils";
import puppeteer from "puppeteer";
const logger = createLogger();
const port = process.env.PORT || 3000;

const pdfGeneration = (...middlewares: RequestHandler[]) => {
    const route = Router()
    route.post('/generate-pdf', ...middlewares, async (req, res) => {
        try {
            const { html } = req.body;

            const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <base href="http://localhost:${port}/"> <!-- adjust in prod -->
          <link rel="stylesheet" href="/css/cv.css">
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox'],
            });

            const page = await browser.newPage();

            await page.setContent(fullHtml, {
                waitUntil: 'networkidle0',
            });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
            });

            await browser.close();

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=resume.pdf',
            });

            res.send(pdfBuffer);
        } catch (error) {
            const err = errorParser(error);
            err.message = 'Failed to generate PDF'
            logger.fatal(err.message, err);
            res.status(500).send(err);
        }
    });

    logger.debug('Request Route Initialized')
    return route;
}

export { pdfGeneration }