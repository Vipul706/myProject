import express from 'express';
import { createLogger, errorParser } from '../utils/utils';
import path from 'path';
import { fileURLToPath } from 'url';
import type { routeRegistration } from '../utils/types';
import { cv, pdf } from './routes'
import { apiHeartBeat, routerSanity } from '../middleware/validators';

const logger = createLogger();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootRoutePath = process.env.API_BASE_PATH
const routePaths: routeRegistration = [{
  routepath: '/cv',
  router: cv,
  middlewares: [],
  authMiddleware: [routerSanity,apiHeartBeat]
},
{
  routepath: '/pdf',
  router: pdf,
  middlewares: [],
  authMiddleware: [apiHeartBeat,routerSanity]
}
]

const initializeApp = async (app: express.Express) => {
  try {
    // 👇 Set the correct views path
    app.set('views', path.join(__dirname, '../views/cv_templates'));
    app.set('view engine', 'ejs');
    app.use(express.json({ limit: '10mb' }));

    //  Serving the Static Files
    app.use(express.static(path.join(__dirname, '../public')));

    routePaths.forEach(routes => {
      logger.info(`Route Path:${rootRoutePath + routes.routepath}`)
      app.use(routes.routepath, routes.router(...routes.authMiddleware, ...routes.middlewares))
    })


    app.listen(port, () => {
      logger.info(`Server running on port ---> ${port}`);
    });
  } catch (error: unknown) {
    const err = errorParser(error);
    logger.fatal(err.message, err);
  }
};

export { initializeApp };
