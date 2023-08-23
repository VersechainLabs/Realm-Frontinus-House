import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

const requestToString = (request: Request) => {
  const methodAndUrl = `${request.method} ${request.url}`;

  let queryParams = '';
  const searchParams: URLSearchParams = new URLSearchParams(
    request.url.split('?')[1] || '',
  );
  searchParams.forEach((value, key) => {
    queryParams += `${key}: ${value}, `;
  });

  if (queryParams.length > 0) {
    queryParams = queryParams.slice(0, -2);
  }

  let requestBody = '';
  if (request.headers['content-type']?.includes('application/json')) {
    requestBody = JSON.stringify(request.body);
  } else if (request.headers['content-type']?.includes('multipart/form-data')) {
    requestBody = 'multipart/form-data content';
  } else if (
    request.headers['content-type']?.includes(
      'application/x-www-form-urlencoded',
    )
  ) {
    requestBody = 'x-www-form-urlencoded content';
  } else {
    requestBody = request.body.toString();
  }

  let result = methodAndUrl;
  if (queryParams.length > 0) {
    result += `\nQuery Params: ${queryParams}`;
  }
  if (requestBody.length > 0) {
    result += `\nBody: ${requestBody}`;
  }
  return result;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: Error, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (httpStatus === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.log(
        `Server Exception: ${exception}, ${requestToString(request)}`,
      );
    }

    let message = exception.message;
    if (exception instanceof HttpException) {
      if (exception.getResponse()['message']) {
        message = exception.getResponse()['message'];
      }
    }
    const responseBody = {
      status: httpStatus,
      message: message,
    };

    httpAdapter.reply(response, responseBody, httpStatus);
  }
}
