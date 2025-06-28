import type { Request, Response } from "express"
import puppeteer from "puppeteer";
import { errorParser } from "../../utils/utils";
import { env } from "../../config/envconfig";
import { createLogger } from "../../utils/logger";
const port = env.port;
const logger = createLogger();

const generatePdf = async (req: Request, res: Response) => {
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
        const err = await errorParser(error, generatePdf.name, 'fatal');
        err.message = 'Failed to generate PDF'
        logger.fatal(err.message, err);
        res.status(500).send(err);
    }
}

export {
    generatePdf
}