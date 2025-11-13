export class AppError extends Error {
  public status: number;
  public code: string;
  public details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code || httpStatusToCode(status);
    this.details = details;
  }
}

export function badRequest(message = 'Bad Request', details?: unknown) {
  return new AppError(400, message, 'BAD_REQUEST', details);
}
export function unauthorized(message = 'Unauthorized', details?: unknown) {
  return new AppError(401, message, 'UNAUTHORIZED', details);
}
export function forbidden(message = 'Forbidden', details?: unknown) {
  return new AppError(403, message, 'FORBIDDEN', details);
}
export function notFound(message = 'Not Found', details?: unknown) {
  return new AppError(404, message, 'NOT_FOUND', details);
}
export function conflict(message = 'Conflict', details?: unknown) {
  return new AppError(409, message, 'CONFLICT', details);
}
export function internal(message = 'Internal Server Error', details?: unknown) {
  return new AppError(500, message, 'INTERNAL', details);
}

function httpStatusToCode(status: number): string {
  switch (status) {
    case 400: return 'BAD_REQUEST';
    case 401: return 'UNAUTHORIZED';
    case 403: return 'FORBIDDEN';
    case 404: return 'NOT_FOUND';
    case 409: return 'CONFLICT';
    default: return 'INTERNAL';
  }
}
