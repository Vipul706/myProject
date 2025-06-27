import express from 'express';
import { createLogger, errorParser } from '../utils/utils';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import minifyHTML from 'express-minify-html';
import type { routeRegistration } from '../utils/types';
import { cv, pdf } from './routes';
import { apiHeartBeat, routerSanity } from '../middleware/validators';
import { env } from '../config/envconfig';
import { connectToDatabase } from '../config/dbConfig';

const logger = createLogger();
const port = env.app_base_path

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootRoutePath = env.app_base_path;
const routePaths: routeRegistration = [
  {
    routepath: '/cv',
    router: cv,
    middlewares: [],
    authMiddleware: [routerSanity, apiHeartBeat]
  },
  {
    routepath: '/pdf',
    router: pdf,
    middlewares: [],
    authMiddleware: [apiHeartBeat, routerSanity]
  }
];

const initializeApp = async (app: express.Express) => {
  try {
    // 👇 Enable compression to reduce response size
    await connectToDatabase();
    app.use(compression());
    // 👇 Enable EJS view engine and template caching
    app.set('views', path.join(__dirname, '../views/cv_templates'));
    app.set('view engine', 'ejs');
    app.set('view cache', true);

    // 👇 Minify HTML responses
    app.use(
      minifyHTML({
        override: true,
        htmlMinifier: {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          minifyJS: true,
          minifyCSS: true
        }
      })
    );

    // 👇 Serve static files with long-term caching
    app.use(
      express.static(path.join(__dirname, '../public'), {
        maxAge: '1y', // Set cache-control max-age
        etag: true
      })
    );

    // 👇 JSON body parser
    app.use(express.json({ limit: '10mb' }));

    // 👇 Register routes
    routePaths.forEach((routes) => {
      logger.info(`Route Path: ${rootRoutePath + routes.routepath}`);
      app.use(
        routes.routepath,
        routes.router(...routes.authMiddleware, ...routes.middlewares)
      );
    });

    app.listen(port, () => {
      logger.info(`🚀 Server running on port ---> ${port}`);
    });
  } catch (error: unknown) {
    const err = await errorParser(error, initializeApp.name, 'fatal');
    logger.fatal(err.message, err);
  }
};

export { initializeApp };
