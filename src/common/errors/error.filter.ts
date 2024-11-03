import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { ZodError } from 'zod';

@Catch(ZodError, HttpException)
export class ErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        code: exception.getStatus(),
        errors: exception.message,
      });
    } else if (exception instanceof ZodError) {
      response.status(400).json({
        code: 400,
        errors: exception.errors,
      });
    } else {
      response.status(500).json({
        code: 500,
        status: 'INTERNAL_SERVER_ERROR',
        errors: exception.message,
      });
    }
  }
}
