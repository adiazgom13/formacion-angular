import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { mapHttpErrorToAppError } from '../errors/http-error.mapper';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/refresh') ||
    req.url.includes('/auth/logout');

  return next(req).pipe(
    catchError((err: unknown) => {
      // Handle refresh before mapping HttpErrorResponse to AppError
      if (err instanceof HttpErrorResponse && err.status === 401 && !isAuthEndpoint) {
        return auth.refresh().pipe(
          switchMap(() => next(req)),
          catchError((refreshErr) => {
            // no access cookie refresh -> redirect to login and map the original 401 unless home
            if (!router.url.startsWith('/home')) {
              router.navigate(['/login']);
            }
            const appError = mapHttpErrorToAppError(err);
            return throwError(() => appError);
          }),
        );
      }

      if (err instanceof HttpErrorResponse) {
        const appError = mapHttpErrorToAppError(err);
        return throwError(() => appError);
      }

      return throwError(() => ({
        code: 'UNKNOWN_ERROR',
        userMessage: 'Error inesperado.',
        details: err,
      }));
    }),
  );
};
