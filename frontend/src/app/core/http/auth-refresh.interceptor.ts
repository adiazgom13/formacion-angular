import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Refreshes the session when an access cookie expires (401) and retries the original request once.
 * Skips auth endpoints to avoid infinite loops.
 */
export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isApiRequest =
    req.url.includes('/api/');
  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/refresh') ||
    req.url.includes('/auth/logout');

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse)) {
        return throwError(() => err);
      }

      if (!isApiRequest || err.status !== 401 || isAuthEndpoint) {
        return throwError(() => err);
      }

      return auth.refresh().pipe(
        switchMap(() => next(req)),
        catchError((refreshErr) => {
          // Refresh failed -> force user back to login
          return throwError(() => refreshErr);
        }),
      );
    }),
  );
};
