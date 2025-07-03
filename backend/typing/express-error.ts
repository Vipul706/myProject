import type { LogLevel } from "./types";

export class AppError extends Error {
  statusCode: number;
  level!: LogLevel;

  constructor(
    message?: string,
    statusCode: number = 500,
    name?: string,
    level?: LogLevel
  ) {
    super(message);
    this.name = name || 'AppError';
    this.level = level!;
    this.statusCode = statusCode;
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      level: this.level,
      name: this.name,
      message: this.message,
    };
  }
}
