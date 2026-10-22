export type AppErrorCode =
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

export interface FieldError {
  field: string;
  message: string;
}

export interface AppError {
  code: AppErrorCode;
  httpStatus?: number;
  userMessage: string;
  
  fieldErrors?: FieldError[];
  details?: unknown;
}
