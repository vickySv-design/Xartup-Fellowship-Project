// Structured logging utility for production-grade logging
// Replaces console.log with proper log levels and context

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development';

  private sanitize(data: any): any {
    if (typeof data !== 'object' || data === null) return data;
    
    const sanitized = { ...data };
    const sensitiveKeys = ['apiKey', 'api_key', 'password', 'token', 'secret'];
    
    for (const key in sanitized) {
      if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
        sanitized[key] = '[REDACTED]';
      }
    }
    return sanitized;
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const sanitizedContext = context ? this.sanitize(context) : {};
    
    const logEntry = {
      timestamp,
      level,
      message,
      ...sanitizedContext,
    };

    // In production, send to logging service (e.g., CloudWatch, Datadog)
    // For now, structured console output
    if (this.isDev) {
      console.log(JSON.stringify(logEntry, null, 2));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }

  debug(message: string, context?: LogContext) {
    if (this.isDev) {
      this.log('debug', message, context);
    }
  }
}

export const logger = new Logger();
