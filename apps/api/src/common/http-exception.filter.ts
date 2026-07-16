import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resBody = exception.getResponse();

      if (typeof resBody === 'object' && resBody !== null) {
        const bodyObj = resBody as Record<string, unknown>;
        const rawCode =
          bodyObj['code'] ??
          bodyObj['error'] ??
          exception.name ??
          'BAD_REQUEST';
        code =
          typeof rawCode === 'string'
            ? rawCode.toUpperCase().replace(/\s+/g, '_')
            : 'BAD_REQUEST';
        const rawMessage = bodyObj['message'] ?? 'Request failed';
        if (Array.isArray(rawMessage)) {
          message = rawMessage
            .map((item) =>
              typeof item === 'string' ? item : JSON.stringify(item),
            )
            .join(', ');
        } else {
          message =
            typeof rawMessage === 'string'
              ? rawMessage
              : JSON.stringify(rawMessage);
        }
      } else {
        message =
          typeof resBody === 'string' ? resBody : JSON.stringify(resBody);
      }
    } else {
      // Log unhandled server error but do not leak details to the client
      console.error('Unhandled exception:', exception);
    }

    response.status(status).json({
      error: {
        code,
        message,
      },
    });
  }
}
