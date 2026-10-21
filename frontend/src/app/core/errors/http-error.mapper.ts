import { HttpErrorResponse } from '@angular/common/http';
import { AppError } from './app-error.model';

export function mapHttpErrorToAppError(err: HttpErrorResponse): AppError {
  if (err.status === 0) {
    return {
      code: 'NETWORK_ERROR',
      httpStatus: 0,
      userMessage: 'No hay conexión con el servidor.',
      details: err,
    };
  }

  // Si el backend devuelve validaciones en un formato conocido,
  // aquí es donde se parsea a fieldErrors. 
  // Ejemplo genérico: { errors: { field1: "msg", field2: "msg2" } }
  const maybeErrors = err.error?.errors;
  if (err.status === 400 && maybeErrors && typeof maybeErrors === 'object') {
    const fieldErrors = Object.entries(maybeErrors).map(([field, message]) => ({
      field,
      message: String(message),
    }));

    return {
      code: 'VALIDATION_ERROR',
      httpStatus: err.status,
      userMessage: 'Revisa los campos del formulario.',
      fieldErrors,
      details: err.error,
    };
  }

  switch (err.status) {
    case 401:
      return {
        code: 'UNAUTHORIZED',
        httpStatus: 401,
        userMessage: 'Sesión caducada o no autorizada.',
        details: err.error,
      };
    case 403:
      return {
        code: 'FORBIDDEN',
        httpStatus: 403,
        userMessage: 'No tienes permisos para realizar esta acción.',
        details: err.error,
      };
    case 404:
      return {
        code: 'NOT_FOUND',
        httpStatus: 404,
        userMessage: 'Recurso no encontrado.',
        details: err.error,
      };
    default:
      if (err.status >= 500) {
        return {
          code: 'SERVER_ERROR',
          httpStatus: err.status,
          userMessage: 'Error del servidor. Inténtalo más tarde.',
          details: err.error,
        };
      }

      return {
        code: 'UNKNOWN_ERROR',
        httpStatus: err.status,
        userMessage: 'No se ha podido completar la operación.',
        details: err.error,
      };
  }
}
