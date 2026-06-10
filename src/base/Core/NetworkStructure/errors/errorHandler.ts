/**
 * Centralized Error Handler
 * Converts various error types to typed exceptions and provides utility methods
 */

import axios, { type AxiosError } from 'axios';
import {
    ApiException,
    BadRequestException,
    UnAuthorizedException,
    ForbiddenException,
    NotFoundException,
    MethodNotAllowedException,
    NotAcceptableException,
    RequestTimeoutException,
    ConflictException,
    RateLimitException,
    InternalServerException,
    NotImplementedException,
    BadGatewayException,
    ServiceUnavailableException,
    GatewayTimeoutException,
    NetworkDisconnectException,
    CancelledRequestException,
    UnKnownException,
    ValidationException,
    ErrorCode,
    RETRYABLE_STATUS_CODES,
} from '@/base/Core/Constants/exceptionConstants';
import { env } from '@/base/Core/Config';

/**
 * Error messages for different error types
 */
const ERROR_MESSAGES: Record<ErrorCode, string> = {
    [ErrorCode.BAD_REQUEST]: 'The request was invalid. Please check your input.',
    [ErrorCode.UNAUTHORIZED]: 'Your session has expired. Please log in again.',
    [ErrorCode.FORBIDDEN]: 'You do not have permission to perform this action.',
    [ErrorCode.NOT_FOUND]: 'The requested resource was not found.',
    [ErrorCode.METHOD_NOT_ALLOWED]: 'This operation is not allowed.',
    [ErrorCode.NOT_ACCEPTABLE]: 'The request format is not supported.',
    [ErrorCode.CONFLICT]: 'A conflict occurred. Please refresh and try again.',
    [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
    [ErrorCode.RATE_LIMITED]: 'Too many requests. Please wait and try again.',
    [ErrorCode.INTERNAL_SERVER_ERROR]: 'Something went wrong. Please try again later.',
    [ErrorCode.NOT_IMPLEMENTED]: 'This feature is not yet available.',
    [ErrorCode.BAD_GATEWAY]: 'Unable to connect to the server. Please try again.',
    [ErrorCode.SERVICE_UNAVAILABLE]: 'The service is temporarily unavailable.',
    [ErrorCode.GATEWAY_TIMEOUT]: 'The server took too long to respond.',
    [ErrorCode.NETWORK_DISCONNECTED]: 'No internet connection. Please check your network.',
    [ErrorCode.REQUEST_TIMEOUT]: 'The request timed out. Please try again.',
    [ErrorCode.REQUEST_CANCELLED]: 'The request was cancelled.',
    [ErrorCode.UNKNOWN]: 'An unexpected error occurred.',
};

/**
 * ErrorHandler - Centralized error handling utilities
 */
export class ErrorHandler {
    /**
     * Convert Axios error to typed ApiException
     */
    static fromAxiosError(error: AxiosError): ApiException {
        // Log error if enabled
        if (env.isLoggingEnabled) {
            console.error('[ErrorHandler] Axios Error:', {
                message: error.message,
                code: error.code,
                status: error.response?.status,
                url: error.config?.url,
            });
        }

        // Check for request cancellation
        if (axios.isCancel(error)) {
            return new CancelledRequestException('Request was cancelled', error);
        }

        // Check for network errors (no response received)
        if (!error.response) {
            // Check for timeout
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                return new RequestTimeoutException('Request timed out', error);
            }

            // Check for network issues
            if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
                return new NetworkDisconnectException('Network connection failed', error);
            }

            return new UnKnownException(error.message || 'Unknown network error', error);
        }

        // Extract response data
        const status = error.response.status;
        const responseData = error.response.data as any;
        const message = responseData?.message || error.message;

        // Handle specific status codes
        switch (status) {
            case 400:
                return new BadRequestException(message, error);

            case 401:
                return new UnAuthorizedException(message, error);

            case 403:
                return new ForbiddenException(message, error);

            case 404:
                return new NotFoundException(message, error);

            case 405:
                return new MethodNotAllowedException(message, error);

            case 406:
                return new NotAcceptableException(message, error);

            case 408:
                return new RequestTimeoutException(message, error);

            case 409:
                return new ConflictException(message, error);

            case 422:
                return new ValidationException(
                    message,
                    responseData?.errors || {},
                    error
                );

            case 429:
                const retryAfter = parseInt(error.response.headers['retry-after'] || '60', 10);
                return new RateLimitException(message, retryAfter, error);

            case 500:
                return new InternalServerException(message, error);

            case 501:
                return new NotImplementedException(message, error);

            case 502:
                return new BadGatewayException(message, error);

            case 503:
                return new ServiceUnavailableException(message, error);

            case 504:
                return new GatewayTimeoutException(message, error);

            default:
                return new UnKnownException(message || `HTTP Error ${status}`, error);
        }
    }

    /**
     * Convert any error to ApiException
     */
    static normalize(error: unknown): ApiException {
        // Already an ApiException
        if (error instanceof ApiException) {
            return error;
        }

        // Axios error
        if (axios.isAxiosError(error)) {
            return this.fromAxiosError(error);
        }

        // Standard Error
        if (error instanceof Error) {
            return new UnKnownException(error.message, error);
        }

        // String error
        if (typeof error === 'string') {
            return new UnKnownException(error);
        }

        // Unknown error type
        return new UnKnownException('An unexpected error occurred');
    }

    /**
     * Check if error is retryable
     */
    static isRetryable(error: unknown): boolean {
        if (error instanceof ApiException) {
            return error.isRetryable;
        }

        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            if (status && RETRYABLE_STATUS_CODES.includes(status)) {
                return true;
            }
            // Network errors are retryable
            if (!error.response && error.code !== 'ERR_CANCELED') {
                return true;
            }
        }

        return false;
    }

    /**
     * Get user-friendly message for an error
     */
    static getUserMessage(error: unknown): string {
        if (error instanceof ApiException) {
            // Return custom message if it's different from default
            const defaultMessage = ERROR_MESSAGES[error.code];
            if (error.message && error.message !== error.code) {
                return error.message;
            }
            return defaultMessage || error.message;
        }

        if (axios.isAxiosError(error)) {
            const response = error.response?.data as any;
            if (response?.message) {
                return response.message;
            }
        }

        if (error instanceof Error) {
            return error.message;
        }

        return ERROR_MESSAGES[ErrorCode.UNKNOWN];
    }

    /**
     * Calculate retry delay with exponential backoff
     * @param attempt - Current attempt number (0-based)
     * @param baseDelay - Base delay in milliseconds
     * @param maxDelay - Maximum delay cap in milliseconds
     */
    static getRetryDelay(
        attempt: number,
        baseDelay: number = 1000,
        maxDelay: number = 30000
    ): number {
        // Exponential backoff: baseDelay * 2^attempt
        const exponentialDelay = baseDelay * Math.pow(2, attempt);

        // Add jitter (random variation to prevent thundering herd)
        const jitter = Math.random() * 0.3 * exponentialDelay;

        // Cap at maxDelay
        return Math.min(exponentialDelay + jitter, maxDelay);
    }

    /**
     * Check if error requires authentication
     */
    static requiresAuth(error: unknown): boolean {
        if (error instanceof UnAuthorizedException) {
            return true;
        }

        if (axios.isAxiosError(error) && error.response?.status === 401) {
            return true;
        }

        return false;
    }

    /**
     * Check if error is a network/connectivity issue
     */
    static isNetworkError(error: unknown): boolean {
        if (error instanceof NetworkDisconnectException) {
            return true;
        }

        if (axios.isAxiosError(error) && !error.response) {
            return true;
        }

        return false;
    }

    /**
     * Check if error is a timeout
     */
    static isTimeout(error: unknown): boolean {
        if (error instanceof RequestTimeoutException) {
            return true;
        }

        if (axios.isAxiosError(error)) {
            return error.code === 'ECONNABORTED' || error.message.includes('timeout');
        }

        return false;
    }

    /**
     * Extract validation errors from error
     */
    static getValidationErrors(error: unknown): Record<string, string[]> {
        if (error instanceof ValidationException) {
            return error.errors;
        }

        if (axios.isAxiosError(error)) {
            const response = error.response?.data as any;
            if (response?.errors && typeof response.errors === 'object') {
                return response.errors;
            }
        }

        return {};
    }

    /**
     * Log error with context
     */
    static logError(
        error: unknown,
        context?: string,
        additionalData?: Record<string, any>
    ): void {
        const normalized = this.normalize(error);

        console.error(`[ErrorHandler]${context ? ` [${context}]` : ''}`, {
            name: normalized.name,
            message: normalized.message,
            code: normalized.code,
            statusCode: normalized.statusCode,
            isRetryable: normalized.isRetryable,
            ...additionalData,
        });
    }
}

export default ErrorHandler;
