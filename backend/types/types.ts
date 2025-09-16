import { type Request, Router, type NextFunction, type Response } from "express";
type LogTransport = {
  log: (message: string, meta: any[], level?: LogLevel,) => void;
};
type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
type LogMethod = (message: string, ...meta: any[]) => void;
type ParsedError = {
  name: string;
  message: string;
  method: string;
  stack: string;
  level: LogLevel,
  code: number
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
  stack: string
  level: LogLevel,
  code: number,
  methodName: string
}
interface logData {
  msg: string,
  level: LogLevel
}

interface EventsMap {
  log: (data: logData) => void;
  error: (err: ErrorLogData) => void;
}

interface SendResetEmailOptions {
  toEmail: string;
  subject?: string;    // Optional, default below
  html:string
}
// types/env.d.ts or next to envconfig.ts
interface EnvSchemaType {
  PORT: string;
  PROJECT_ENV: string;
  API_BASE_PATH: string;
  USER: string;
  PASS: string;
  MAXPOOLSIZE: string;
  MINPOOLSIZE: string;
  DB_URL: string;
  DB_NAME: string;
  LOG_LEVEL: string;
  JWTKEY: string;
  loginDashboardUrl: string;
  defaultEmail: string;
  email_pass: string;
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
  SendResetEmailOptions,
  EnvSchemaType
}
