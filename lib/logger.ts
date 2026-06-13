export type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    [key: string]: any;
  };
}

class StructuredLogger {
  private formatLog(level: LogLevel, message: string, metaOrError?: any): string {
    const payload: LogPayload = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (metaOrError) {
      if (metaOrError instanceof Error) {
        payload.error = {
          message: metaOrError.message,
          stack: metaOrError.stack,
        };
      } else if (typeof metaOrError === "object") {
        const { error, ...meta } = metaOrError;
        if (error instanceof Error) {
          payload.error = {
            message: error.message,
            stack: error.stack,
          };
        } else if (error) {
          payload.error = { message: String(error) };
        }
        if (Object.keys(meta).length > 0) {
          payload.metadata = meta;
        }
      } else {
        payload.metadata = { extra: metaOrError };
      }
    }

    return JSON.stringify(payload);
  }

  info(message: string, metadata?: any) {
    console.log(this.formatLog("info", message, metadata));
  }

  warn(message: string, metadata?: any) {
    console.warn(this.formatLog("warn", message, metadata));
  }

  error(message: string, metaOrError?: any) {
    console.error(this.formatLog("error", message, metaOrError));
  }
}

export const logger = new StructuredLogger();
