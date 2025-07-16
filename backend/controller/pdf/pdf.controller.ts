import type { Request, Response } from "express"
import puppeteer from "puppeteer";
import { env } from "../../config/envconfig";
import { emitter } from "../../utils/emiter";
const port = env.port;

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
    } catch (error:any) {
        emitter.emit('error', {
            msg: error.message,
            err: error,
            level: error.level,
            code: 500,
            methodName: generatePdf.name
        })
        res.status(500).send(error);
    }
}

export {
    generatePdf
}