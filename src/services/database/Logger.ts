export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface Logger {
  log(level: LogLevel, message: string, context?: Record<string, unknown>): void;
}

export class ConsoleLogger implements Logger {
  public log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const details = context ? [context] : [];
    const method =
      level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.info;
    method(`[Roadmap Studio] ${level}: ${message}`, ...details);
  }
}

export const logger = new ConsoleLogger();
