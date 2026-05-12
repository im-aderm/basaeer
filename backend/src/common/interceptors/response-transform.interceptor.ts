import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse, apiOk } from '../dto/api-response';

/**
 * Global response interceptor that wraps all successful controller responses
 * in a standardized `ApiSuccessResponse<T>` envelope.
 *
 * Controllers can still return PaginatedResponse or custom shapes as needed.
 * This interceptor only wraps plain data objects/arrays that don't already
 * have a `success` field.
 */
@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccessResponse<T> | T
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiSuccessResponse<T> | T> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => {
        // If the response already has a `success` field, it's already wrapped
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // If it's a raw Express response (e.g., file download), pass through
        if (data === undefined || data === null) {
          return apiOk(data, request.url);
        }

        return apiOk(data, request.url);
      }),
    );
  }
}
