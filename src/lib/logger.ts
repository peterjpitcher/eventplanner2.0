/**
 * Logger utility for standardized logging across the application
 * This provides a consistent interface for logging with support for different log levels and namespacing
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

// Get the current log level from the environment or default to 'info'
const getCurrentLogLevel = (): LogLevel => {
  const level = process.env.NEXT_PUBLIC_LOG_LEVEL?.toLowerCase() as LogLevel;
  return ['debug', 'info', 'warn', 'error'].includes(level) ? level : 'info';
};

// Map log levels to numeric values for comparison
const LOG_LEVEL_VALUES: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

/**
 * Creates a logger instance with a specific namespace
 * @param namespace The namespace for the logger (usually the service or component name)
 * @returns A logger object with methods for different log levels
 */
export function createLogger(namespace: string): Logger {
  const currentLogLevel = getCurrentLogLevel();
  const currentLevelValue = LOG_LEVEL_VALUES[currentLogLevel];

  // Helper function to check if a log level should be displayed
  const shouldLog = (level: LogLevel): boolean => {
    return LOG_LEVEL_VALUES[level] >= currentLevelValue;
  };

  // Format the log message with the namespace and timestamp
  const formatMessage = (level: LogLevel, message: string): string => {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${namespace}] ${message}`;
  };

  return {
    debug: (message: string, ...args: any[]) => {
      if (shouldLog('debug')) {
        console.debug(formatMessage('debug', message), ...args);
      }
    },
    info: (message: string, ...args: any[]) => {
      if (shouldLog('info')) {
        console.info(formatMessage('info', message), ...args);
      }
    },
    warn: (message: string, ...args: any[]) => {
      if (shouldLog('warn')) {
        console.warn(formatMessage('warn', message), ...args);
      }
    },
    error: (message: string, ...args: any[]) => {
      if (shouldLog('error')) {
        console.error(formatMessage('error', message), ...args);
      }
    }
  };
}

// Create a default logger for general use
export const logger = createLogger('app'); 