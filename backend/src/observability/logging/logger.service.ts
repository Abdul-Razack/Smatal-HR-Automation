import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger extends ConsoleLogger {
  // Extending the default logger to provide a foundation for future Pino/Datadog integration

  error(message: any, stack?: string, context?: string): void {
    // Add custom error formatting or alerting logic here in Phase 5.3
    super.error(message, stack, context);
  }

  warn(message: any, context?: string): void {
    super.warn(message, context);
  }

  log(message: any, context?: string): void {
    super.log(message, context);
  }

  debug(message: any, context?: string): void {
    super.debug(message, context);
  }
}
