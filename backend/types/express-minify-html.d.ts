declare module 'express-minify-html' {
  import { RequestHandler } from 'express';

  interface MinifyHTMLOptions {
    override?: boolean;
    htmlMinifier?: {
      collapseWhitespace?: boolean;
      removeComments?: boolean;
      removeRedundantAttributes?: boolean;
      removeScriptTypeAttributes?: boolean;
      removeStyleLinkTypeAttributes?: boolean;
      minifyJS?: boolean;
      minifyCSS?: boolean;
    };
  }

  function minifyHTML(options?: MinifyHTMLOptions): RequestHandler;

  export = minifyHTML;
}
