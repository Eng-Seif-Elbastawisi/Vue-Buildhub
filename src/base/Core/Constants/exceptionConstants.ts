/**
 * API Exception Constants
 * Enhanced exception classes with error codes, retry info, and user-friendly messages
 */

/**
 * Error codes for categorizing exceptions
 */
export const ErrorCode = {
    // Client Errors (4xx)
    BAD_REQUEST: 'BAD_REQUEST',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
    NOT_ACCEPTABLE: 'NOT_ACCEPTABLE',
    CONFLICT: 'CONFLICT',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    RATE_LIMITED: 'RATE_LIMITED',

    // Server Errors (5xx)
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
    BAD_GATEWAY: 'BAD_GATEWAY',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    GATEWAY_TIMEOUT: 'GATEWAY_TIMEOUT',

    // Network Errors
    NETWORK_DISCONNECTED: 'NETWORK_DISCONNECTED',
    REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
    REQUEST_CANCELLED: 'REQUEST_CANCELLED',

    // Unknown
    UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * Base API Exception class
 * All network-related exceptions extend from this
 */
export class ApiException extends Error {
    public readonly code: ErrorCode;
    public readonly isRetryable: boolean;
    public readonly statusCode?: number;
    public readonly originalError?: Error;

    constructor(
        message: string,
        code: ErrorCode = ErrorCode.UNKNOWN,
        isRetryable: boolean = false,
        statusCode?: number,
        originalError?: Error
    ) {
        super(message);
        this.code = code;
        this.isRetryable = isRetryable;
        this.statusCode = statusCode;
        this.originalError = originalError;
        this.name = this.constructor.name;

        // Maintains proper stack trace for where error was thrown (V8 engines)
        if ((Error as any).captureStackTrace) {
            (Error as any).captureStackTrace(this, this.constructor);
        }
    }

    /**
     * Create a user-friendly message
     */
    get userMessage(): string {
        return this.message;
    }

    /**
     * Convert to JSON for logging
     */
    toJSON(): Record<string, any> {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            isRetryable: this.isRetryable,
        };
    }
}

// ============================================================================
// Client Error Exceptions (4xx)
// ============================================================================

export class BadRequestException extends ApiException {
    constructor(message: string = 'Bad request', originalError?: Error) {
        super(message, ErrorCode.BAD_REQUEST, false, 400, originalError);
    }
}

export class UnAuthorizedException extends ApiException {
    constructor(message: string = 'Unauthorized access', originalError?: Error) {
        super(message, ErrorCode.UNAUTHORIZED, false, 401, originalError);
    }
}

export class ForbiddenException extends ApiException {
    constructor(message: string = 'Access forbidden', originalError?: Error) {
        super(message, ErrorCode.FORBIDDEN, false, 403, originalError);
    }
}

export class NotFoundException extends ApiException {
    constructor(message: string = 'Resource not found', originalError?: Error) {
        super(message, ErrorCode.NOT_FOUND, false, 404, originalError);
    }
}

export class MethodNotAllowedException extends ApiException {
    constructor(message: string = 'Method not allowed', originalError?: Error) {
        super(message, ErrorCode.METHOD_NOT_ALLOWED, false, 405, originalError);
    }
}

export class NotAcceptableException extends ApiException {
    constructor(message: string = 'Not acceptable', originalError?: Error) {
        super(message, ErrorCode.NOT_ACCEPTABLE, false, 406, originalError);
    }
}

export class ConflictException extends ApiException {
    constructor(message: string = 'Conflict', originalError?: Error) {
        super(message, ErrorCode.CONFLICT, false, 409, originalError);
    }
}

export class ValidationException extends ApiException {
    public readonly errors: Record<string, string[]>;

    constructor(
        message: string = 'Validation failed',
        errors: Record<string, string[]> = {},
        originalError?: Error
    ) {
        super(message, ErrorCode.VALIDATION_ERROR, false, 422, originalError);
        this.errors = errors;
    }
}

export class RateLimitException extends ApiException {
    public readonly retryAfter?: number;

    constructor(
        message: string = 'Too many requests',
        retryAfter?: number,
        originalError?: Error
    ) {
        super(message, ErrorCode.RATE_LIMITED, true, 429, originalError);
        this.retryAfter = retryAfter;
    }
}

// ============================================================================
// Server Error Exceptions (5xx)
// ============================================================================

export class InternalServerException extends ApiException {
    constructor(message: string = 'Internal server error', originalError?: Error) {
        super(message, ErrorCode.INTERNAL_SERVER_ERROR, true, 500, originalError);
    }
}

export class NotImplementedException extends ApiException {
    constructor(message: string = 'Not implemented', originalError?: Error) {
        super(message, ErrorCode.NOT_IMPLEMENTED, false, 501, originalError);
    }
}

export class BadGatewayException extends ApiException {
    constructor(message: string = 'Bad gateway', originalError?: Error) {
        super(message, ErrorCode.BAD_GATEWAY, true, 502, originalError);
    }
}

export class ServiceUnavailableException extends ApiException {
    constructor(message: string = 'Service unavailable', originalError?: Error) {
        super(message, ErrorCode.SERVICE_UNAVAILABLE, true, 503, originalError);
    }
}

export class GatewayTimeoutException extends ApiException {
    constructor(message: string = 'Gateway timeout', originalError?: Error) {
        super(message, ErrorCode.GATEWAY_TIMEOUT, true, 504, originalError);
    }
}

// ============================================================================
// Network Exceptions
// ============================================================================

export class NetworkDisconnectException extends ApiException {
    constructor(message: string = 'Network disconnected', originalError?: Error) {
        super(message, ErrorCode.NETWORK_DISCONNECTED, true, undefined, originalError);
    }
}

export class RequestTimeoutException extends ApiException {
    constructor(message: string = 'Request timed out', originalError?: Error) {
        super(message, ErrorCode.REQUEST_TIMEOUT, true, 408, originalError);
    }
}

export class CancelledRequestException extends ApiException {
    constructor(message: string = 'Request was cancelled', originalError?: Error) {
        super(message, ErrorCode.REQUEST_CANCELLED, false, undefined, originalError);
    }
}

// ============================================================================
// Unknown Exception
// ============================================================================

export class UnKnownException extends ApiException {
    constructor(message: string = 'Unknown error', originalError?: Error) {
        super(message, ErrorCode.UNKNOWN, false, undefined, originalError);
    }
}

// ============================================================================
// HTTP Status to Exception Mapping
// ============================================================================

export const STATUS_TO_EXCEPTION: Record<number, new (message?: string, originalError?: Error) => ApiException> = {
    400: BadRequestException,
    401: UnAuthorizedException,
    403: ForbiddenException,
    404: NotFoundException,
    405: MethodNotAllowedException,
    406: NotAcceptableException,
    408: RequestTimeoutException,
    409: ConflictException,
    429: RateLimitException as any,
    500: InternalServerException,
    501: NotImplementedException,
    502: BadGatewayException,
    503: ServiceUnavailableException,
    504: GatewayTimeoutException,
};

/**
 * Create exception from HTTP status code
 */
export function createExceptionFromStatus(
    statusCode: number,
    message?: string,
    originalError?: Error
): ApiException {
    const ExceptionClass = STATUS_TO_EXCEPTION[statusCode];

    if (ExceptionClass) {
        return new ExceptionClass(message, originalError);
    }

    return new UnKnownException(message || `HTTP Error ${statusCode}`, originalError);
}

/**
 * Check if an exception is retryable
 */
export function isRetryableException(error: unknown): boolean {
    if (error instanceof ApiException) {
        return error.isRetryable;
    }
    return false;
}

/**
 * Get retryable status codes
 */
export const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];
