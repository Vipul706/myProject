import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import minifyHTML from 'express-minify-html';
import type { routeRegistration } from '../types/types';
import { cv, login, pdf } from './routes';
import { apiHeartBeat, globalErrorHandler, routerSanity } from '../middleware/validators';
import { env } from '../config/envconfig';
import { connectToDatabase } from '../config/dbconfig';
import { centralLoggingEmitter, emitter, toggleEmitter } from '../utils/emiter';
import { AppError } from '../types/express-error';
import { dashboardRoutes } from './dashboard/dashboard';
import { seedUserWithResume } from '../utils/utils';
import { registerCrons } from '../crons';

const port = env.port

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootRoutePath = env.app_base_path;

const routePaths: routeRegistration = [
  {
    routepath: '/cv',
    router: cv,
    middlewares: [],
    authMiddleware: [apiHeartBeat]
  },
  {
    routepath: '/pdf',
    router: pdf,
    middlewares: [],
    authMiddleware: [apiHeartBeat]
  },
  {
    routepath: '/login',
    router: login,
    middlewares: [],
    authMiddleware: [apiHeartBeat]
  },
  {
    routepath: '/dashboard',
    router: dashboardRoutes,
    middlewares: [],
    authMiddleware: [apiHeartBeat, routerSanity]
  }
];


const initializeApp = async (app: express.Express) => {
  try {
    // 👇 Enable compression to reduce response size
    await centralLoggingEmitter()
    await connectToDatabase();
    registerCrons()

    app.use(compression());
    // 👇 Enable EJS view engine and template caching
    app.set('views', path.join(__dirname, '../views'));
    app.set('view engine', 'ejs');
    // app.set('view cache', true);

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
      express.static(path.join(__dirname, '../public'))
    );

    // 👇 JSON body parser
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // 👇 Register routes
    for (const routes of routePaths) {
      emitter.emit('log', {
        msg: `Route Path: ${rootRoutePath + routes.routepath}`,
        level: 'info'
      })
      const router = await routes.router(...routes.authMiddleware, ...routes.middlewares);
      if (router) {
        app.use(routes.routepath, router);
      }
    }


    //  GlobalErrorHandler Registered
    app.use(globalErrorHandler);
    await seedUserWithResume()
    app.listen(port, () => {
      emitter.emit('log', {
        msg: `🚀 Server running on port ---> ${port}`,
        level: 'info'
      })
    });
  } catch (e: any) {
    const error = e as AppError;
    const orgError = new AppError(error.stack, error.message, 500, dashboardRoutes.name, 'Server Error');
    toggleEmitter('off')
    emitter.emit('error', {
      msg: orgError.message,
      stack: orgError.stack!,
      level: orgError.level,
      code: error.statusCode,
      methodName: error.methodName
    });
  }
};

export { initializeApp };
