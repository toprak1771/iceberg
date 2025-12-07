import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorWithMessage {
  message?: string;
  stack?: string;
}

interface ExceptionResponseObject {
  message?: string;
  [key: string]: unknown;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : ((exception as ErrorWithMessage)?.message ?? 'Internal server error');

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : ((exceptionResponse as ExceptionResponseObject)?.message ??
          'Internal server error');

    const stack = (exception as ErrorWithMessage)?.stack;

    this.logger.error(
      `${request?.method} ${request?.url} -> ${status} ${message}`,
      stack,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request?.url,
      method: request?.method,
      message,
      error:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : exceptionResponse,
    });
  }
}
