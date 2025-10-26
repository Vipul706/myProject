import type { Request, Response } from "express";
import puppeteer from "puppeteer";
import { env } from "../../config/envconfig";
import { emitter } from "../../utils/emiter";
import { AppError } from "../../types/express-error";

const port = env.port;

const generatePdf = async (request: Request, reply: Response) => {
  try {
    const { html } = request.body as { html: string };

    const fullHtml = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <base href="http://localhost:${port}/">
      <link rel="stylesheet" href="/css/cv.css">
      <style>
        @page { size: A4; margin: 0; }
        html, body { margin: 0; padding: 0; background: white; }
        .a4-page {
          width: 210mm;
          height: 297mm;
          box-shadow: none !important;
          margin: 0 auto;
          overflow: hidden;
          position: relative;
        }
        .a4-page:not(:last-child) {
          page-break-after: always;
        }
      </style>
    </head>
    <body>${html}</body>
  </html>
`;

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "networkidle0" });

    // ✅ Generate PDF with header/footer (Page X of Y)
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "20mm", right: "10mm", bottom: "20mm", left: "10mm" },
      displayHeaderFooter: true,
      headerTemplate: "<span></span>", // no header
      footerTemplate: `
        <div style="font-size:10px; color:gray; width:100%; text-align:center; padding-top:5px;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `,
    });

    await browser.close();

    reply.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=resume.pdf",
    });

    reply.send(pdfBuffer);
  } catch (e: any) {
    const error = e as AppError;
    const orgError = new AppError(
      error.stack,
      error.message,
      500,
      generatePdf.name,
      "Server Error"
    );
    emitter.emit("error", {
      msg: orgError.message,
      stack: orgError.stack!,
      level: orgError.level,
      code: error.statusCode,
      methodName: error.methodName,
    });
    reply.status(500).send({
      errorCode: orgError.message,
      status: orgError.statusCode,
      error: orgError,
    });
  }
};

export { generatePdf };
