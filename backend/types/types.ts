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
  level: LogLevel,
  code:number
};


type MiddlewareFn = (request: Request, reply: Response, next: NextFunction) => void | Promise<void>;

type routeRegistration = {
  routepath: string,
  router: (...middlewares: MiddlewareFn[]) => Promise<Router | undefined>,
  middlewares: MiddlewareFn[],
  authMiddleware: MiddlewareFn[],
}[];

interface ErrorLogData {
    msg: string,
    err?: any,
    level: LogLevel,
    code: number,
    methodName: string
}
interface logData {
 msg:string,
 level:LogLevel
}

interface EventsMap {
    log: (data: logData) => void;
    error: (err: ErrorLogData) => void;
}

interface SendResetEmailOptions {
  toEmail: string;
  resetLink: string;
  fromEmail?: string;  // Optional, default below
  subject?: string;    // Optional, default below
}

export type {
  LogMethod,
  LogLevel,
  LogTransport,
  ParsedError,
  routeRegistration,
  ErrorLogData,
  logData,
  EventsMap,
  SendResetEmailOptions
}
