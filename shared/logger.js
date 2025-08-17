import winston from 'winston';
import * as stackTrace from 'stack-trace';
const { combine, timestamp, printf, colorize, align, prettyPrint, metadata } = winston.format;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
      
    printf((info) => {
      const trace = stackTrace.get();
      let caller = null;
      for (let i = 1; i < trace.length; i++) {
        const frame = trace[i];
        const fileName = frame.getFileName();
        if (fileName && 
            !fileName.includes('logger.js') &&
            !fileName.includes('node_modules') && 
            !fileName.includes('node:internal') &&
            !fileName.includes('winston') &&
            !fileName.includes('_stream_') &&
            fileName.endsWith('.js')) {
          caller = frame;
          break;
        }
      }
      caller = caller || trace[1];
      
      const functionName = caller.getFunctionName() || 'anonymous';
      const fileName = caller.getFileName() ? caller.getFileName().split('/').pop() : 'unknown';
      const lineNumber = caller.getLineNumber();
      
      const colors = {
        error: '\x1b[31m',   // red
        warn: '\x1b[33m',    // yellow
        info: '\x1b[32m',    // green
        debug: '\x1b[36m',   // cyan
        verbose: '\x1b[35m', // magenta
        silly: '\x1b[37m'    // white
      };
      const reset = '\x1b[0m';
      const coloredLevel = `${colors[info.level] || ''}${info.level.toUpperCase()}${reset}`;
      
      const metaLog = info.metadata && Object.keys(info.metadata).length
        ? `\n${JSON.stringify(info.metadata, null, 2)}`
        : '';
      
      return `${info.timestamp} - ${coloredLevel} - ${fileName}/${functionName} - Ln-${lineNumber}\n${info.message}${metaLog}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

export default logger;