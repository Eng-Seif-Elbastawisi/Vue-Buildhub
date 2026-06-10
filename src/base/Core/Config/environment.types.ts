/**
 * Environment Configuration Types
 * Defines the structure for different deployment stages
 */

/**
 * Available environment stages
 */
export type EnvironmentStage = 'development' | 'production' | 'test';

/**
 * Configuration options for each environment
 */
export interface EnvironmentConfig {
    /** Current stage identifier */
    stage: EnvironmentStage;

    /** Base URL for API requests */
    apiBaseUrl: string;

    /** Default request timeout in milliseconds */
    timeout: number;

    /** Enable console logging */
    enableLogging: boolean;

    /** Use static/mock data instead of real API calls */
    useStaticData: boolean;

    /** Enable retry for failed requests */
    enableRetry: boolean;

    /** Maximum retry attempts */
    maxRetryAttempts: number;

    /** Initial retry delay in milliseconds */
    retryDelay: number;
}

/**
 * Request-specific configuration that can override defaults
 */
export interface RequestConfig {
    /** Override default timeout for this request */
    timeout?: number;

    /** AbortSignal for request cancellation */
    signal?: AbortSignal;

    /** Callback for upload/download progress */
    onProgress?: (event: ProgressEvent) => void;

    /** Number of retry attempts for this request */
    retryCount?: number;

    /** Whether to show loading dialog */
    showLoadingDialog?: boolean;

    /** Whether to show error dialog on failure */
    showErrorDialog?: boolean;
}

/**
 * Retry configuration options
 */
export interface RetryOptions {
    /** Maximum number of retry attempts */
    maxAttempts: number;

    /** Initial delay before first retry (ms) */
    initialDelay: number;

    /** Multiplier for exponential backoff */
    backoffMultiplier: number;

    /** Maximum delay between retries (ms) */
    maxDelay: number;

    /** HTTP status codes that should trigger retry */
    retryableStatuses: number[];
}

/**
 * Default retry options
 */
export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
    maxAttempts: 3,
    initialDelay: 1000,
    backoffMultiplier: 2,
    maxDelay: 10000,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
};
