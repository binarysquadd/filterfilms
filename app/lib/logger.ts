type LogLevel = 'info' | 'warn' | 'error';

type LogPayload = Record<string, unknown>;

function writeLog(level: LogLevel, event: string, payload?: LogPayload) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    event,
    ...(payload ? { payload } : {}),
  };

  const message = JSON.stringify(entry);

  switch (level) {
    case 'error':
      console.error(message);
      break;
    case 'warn':
      console.warn(message);
      break;
    default:
      console.info(message);
  }
}

export const logger = {
  info(event: string, payload?: LogPayload) {
    writeLog('info', event, payload);
  },
  warn(event: string, payload?: LogPayload) {
    writeLog('warn', event, payload);
  },
  error(event: string, payload?: LogPayload) {
    writeLog('error', event, payload);
  },
};
