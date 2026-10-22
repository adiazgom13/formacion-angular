import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Cookie-based auth: ensure API requests send/receive HttpOnly cookies.
 * Keeps the change centralized so services don't need to repeat withCredentials everywhere.
 */
export const withCredentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Only for backend API calls routed through the dev-server proxy.
  if (req.url.startsWith('api/')) {
    return next(req.clone({ withCredentials: true }));
  }

  return next(req);
};
