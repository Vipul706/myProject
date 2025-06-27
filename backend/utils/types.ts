import { type Request, Router, type NextFunction, type Response } from "express";
type LogTransport = {
  log: (level: LogLevel, message: string, meta: any[]) => void;
};
type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
type LogMethod = (message: string, ...meta: any[]) => void;
type ParsedError = {
  name: string;
  message: string;
  method:string;
  stack: string;
};


type MiddlewareFn = (request: Request, reply: Response, next: NextFunction) => void | Promise<void>;

type routeRegistration = {
  routepath: string,
  router: (...middlewares: MiddlewareFn[]) => Router,
  middlewares: MiddlewareFn[],
  authMiddleware: MiddlewareFn[],
}[];

export type {
  LogMethod,
  LogLevel,
  LogTransport,
  ParsedError,
  routeRegistration
}
