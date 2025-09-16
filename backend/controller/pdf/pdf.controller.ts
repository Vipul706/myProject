import type { Request, Response } from "express";
import puppeteer from "puppeteer";
import { env } from "../../config/envconfig";
import { emitter } from "../../utils/emiter";
import { AppError } from "../../types/express-error";

const port = env.port;

const generatePdf = async (request: Request, reply: Response) => {
  try {
    const { html } = request.body as { html: string };;

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <base href="http://localhost:${port}/">
          <link rel="stylesheet" href="/css/cv.css">
        </head>
        <body>${html}</body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });

    const page = await browser.newPage();

    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();

    reply.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=resume.pdf',
    });

    reply.send(pdfBuffer);
  } catch (e: any) {
    const error = e as AppError;
    const orgError = new AppError(error.stack, error.message, 500, generatePdf.name, 'Server Error');
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

export { generatePdf };
