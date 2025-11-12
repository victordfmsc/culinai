import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

interface LogMetadata {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private minLevel: LogLevel = LogLevel.INFO;
  private readonly isProduction: boolean;

  constructor() {
    this.isProduction = environment.production;
    // In production, set to WARN or ERROR
    // In development, set to DEBUG or INFO
    this.minLevel = this.isProduction ? LogLevel.WARN : LogLevel.DEBUG;
  }

  debug(category: string, message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.DEBUG, category, message, metadata);
  }

  info(category: string, message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.INFO, category, message, metadata);
  }

  warn(category: string, message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.WARN, category, message, metadata);
  }

  error(category: string, message: string, error?: Error | any, metadata?: LogMetadata): void {
    const errorMetadata = {
      ...metadata,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    };
    this.log(LogLevel.ERROR, category, message, errorMetadata);
  }

  private log(level: LogLevel, category: string, message: string, metadata?: LogMetadata): void {
    if (level < this.minLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const prefix = this.getLogPrefix(level);
    
    const logEntry = {
      timestamp,
      level: levelName,
      category,
      message,
      ...metadata
    };

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`${prefix}[${timestamp}] [${category}] ${message}`, metadata || '');
        break;
      case LogLevel.INFO:
        console.log(`${prefix}[${timestamp}] [${category}] ${message}`, metadata || '');
        break;
      case LogLevel.WARN:
        console.warn(`${prefix}[${timestamp}] [${category}] ${message}`, metadata || '');
        break;
      case LogLevel.ERROR:
        console.error(`${prefix}[${timestamp}] [${category}] ${message}`, metadata || '');
        break;
    }

    // In production, send to monitoring service (e.g., Sentry, LogRocket)
    if (this.isProduction && level >= LogLevel.ERROR) {
      this.sendToMonitoring(logEntry);
    }
  }

  private getLogPrefix(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return '🔍 ';
      case LogLevel.INFO: return '✅ ';
      case LogLevel.WARN: return '⚠️ ';
      case LogLevel.ERROR: return '❌ ';
      default: return '';
    }
  }

  private sendToMonitoring(logEntry: any): void {
    // Send structured log entry to external monitoring service
    // Integration points for Sentry, LogRocket, DataDog, etc.
    
    // Example Sentry integration:
    // if (typeof Sentry !== 'undefined') {
    //   Sentry.captureException(logEntry.error, {
    //     level: logEntry.level.toLowerCase(),
    //     extra: logEntry
    //   });
    // }
    
    // Example LogRocket integration:
    // if (typeof LogRocket !== 'undefined') {
    //   LogRocket.captureException(logEntry.error, {
    //     tags: { category: logEntry.category },
    //     extra: logEntry
    //   });
    // }
    
    // For now, ensure the error is logged for console visibility
    console.error('[MONITORING]', logEntry);
  }
}
