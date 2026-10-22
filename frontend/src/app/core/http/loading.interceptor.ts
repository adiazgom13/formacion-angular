import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

/**
 * Global loading interceptor.
 *
 * Default behavior:
 * - Tracks non-GET requests (POST/PUT/PATCH/DELETE) with the global overlay.
 * - GET requests are considered "local loading" and won't trigger the overlay.
 *
 * You can override:
 * - Add header `X-Skip-Loading: true` to skip tracking.
 * - Add header `X-Use-Global-Loading: true` to force tracking even for GET.
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);

  const skip = req.headers.get('X-Skip-Loading') === 'true';
  if (skip) {
    return next(req);
  }

  const useGlobalHeader = req.headers.get('X-Use-Global-Loading') === 'true';
  const isGet = req.method.toUpperCase() === 'GET';

  const shouldTrack = useGlobalHeader || !isGet;
  if (!shouldTrack) {
    return next(req);
  }

  loading.start();

  return next(req).pipe(
    finalize(() => {
      loading.stop();
    })
  );
};
