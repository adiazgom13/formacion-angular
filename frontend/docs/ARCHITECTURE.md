# Frontend architecture

## Stack

- Angular 21 (standalone-style app configuration)
- RxJS
- Angular HttpClient
- TailwindCSS present in devDependencies

## App composition

- Bootstrap: `src/main.ts`
- App root: `src/app/app.ts` + `src/app/app.html` + `src/app/app.css`
- App config: `src/app/app.config.ts`
- Routes: `src/app/app.routes.ts`

## Modules (by folder)

### `src/app/core/`
Cross-cutting concerns used by features:

- `services/`: HTTP-facing services (e.g. `CarsService`) and UI services (toast/loading)
- `http/`: HTTP interceptors (loading, credential handling, error mapping, refresh)
- `interfaces/`: shared domain and DTO-like interfaces used by services/components
- `errors/`: error model + mapping from HTTP errors into app errors

### `src/app/features/`
Route-level components/pages. Current routes include login, home, catalogue, brands, car details.

### `src/app/shared/`
Reusable UI components (navbar, toast, loading overlay).

## Backend integration

During development, calls are proxied by `proxy.conf.json`:

- requests to `/api/*` are forwarded to `http://localhost:3000/*` with `/api` stripped
- requests to `/images/*` are forwarded to `http://localhost:3000/images/*`

Because of this, services generally use relative URLs like `api/cars` (no leading slash).
