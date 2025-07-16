import type { LogLevel } from "./types";

export class AppError extends Error {
  statusCode: number;
  level!: LogLevel;
  methodName: string;
  stack?: string | undefined;
  constructor(
    stack?:string,
    message?: string,
    statusCode: number = 500,
    methodName?: string,
    name?: string,
    level: LogLevel = 'fatal',
  ) {
    super(message);
    this.name = name || 'AppError';
    this.level = level!;
    this.statusCode = statusCode;
    this.methodName = methodName!
    this.stack = stack
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      level: this.level,
      name: this.name,
      message: this.message,
      methodName:this.methodName,
      strack:this.stack
    };
  }
}
