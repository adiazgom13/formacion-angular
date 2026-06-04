import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { mapHttpErrorToAppError } from '../errors/http-error.mapper';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const appError = mapHttpErrorToAppError(err);
        return throwError(() => appError);
      }

      // Si no es HttpErrorResponse, lo envolvemos como UNKNOWN
      return throwError(() => ({
        code: 'UNKNOWN_ERROR',
        userMessage: 'Error inesperado.',
        details: err,
      }));
    })
  );
};
