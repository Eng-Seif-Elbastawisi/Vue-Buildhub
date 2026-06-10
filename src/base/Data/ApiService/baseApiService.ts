import type Params from '@/base/Core/Params/params';
import ServicesInterface, {
  CrudType,
  type ApiResponse,
  type ExtendedCallOptions,
  type ProgressCallback,
} from './apiServiceInterface';
import { env } from '@/base/Core/Config/index';

/**
 * Configuration for API endpoints supporting CRUD operations.
 * All endpoints are plain strings — IDs are sent in the body via Params.
 */
export interface ApiEndpoints {
  /** List/index endpoint */
  index?: string;

  /** Show single item endpoint */
  show?: string;

  /** Create endpoint */
  create?: string;

  /** Update endpoint */
  update?: string;

  /** Delete endpoint */
  delete?: string;
}

/**
 * Custom endpoint configuration
 */
export interface CustomEndpointConfig {
  /** Endpoint URL */
  url: string;

  /** HTTP method */
  method: CrudType;

  /** Request parameters */
  params?: Params;

  /** Query parameters */
  queryParams?: Record<string, any>;

  /** Request headers */
  headers?: Record<string, string>;
}

/**
 * Options for API service method calls.
 */
export interface ApiCallOptions extends ExtendedCallOptions {
  /** Require authentication */
  auth?: boolean;

  /** Show loading dialog */
  showLoadingDialog?: boolean;

  /** Custom headers */
  headers?: Record<string, string>;

  /** Query parameters */
  details?: Record<string, any>;

  /** Use PUT instead of POST/FormData for update */
  usePut?: boolean;

  /** Use JSON instead of FormData for create/update */
  useJson?: boolean;

  /** Use POST instead of the default method */
  usePost?: boolean;

  /**
   * Override the global env.useStaticData for this call only.
   * Pass `true` to force mock data even in development mode.
   * Pass `false` to force a real API call even in test mode.
   * Omit to follow the global VITE_APP_ENV setting.
   */
  useStaticData?: boolean;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Maximum retry attempts */
  maxAttempts: number;

  /** Initial delay in ms */
  initialDelay: number;

  /** Backoff multiplier */
  backoffMultiplier: number;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  backoffMultiplier: 2,
};

/**
 * Base API Service providing standard CRUD operations.
 * All endpoints default to POST with Params in the body.
 * Extend this class and define endpoints for feature-specific services.
 *
 * @example
 * ```typescript
 * class ProductApiService extends BaseApiService {
 *   protected get endpoints() {
 *     return {
 *       index: '/api/products',
 *       show: '/api/products/show',
 *       create: '/api/products',
 *       update: '/api/products/update',
 *       delete: '/api/products/delete',
 *     };
 *   }
 * }
 * ```
 */
export default abstract class BaseApiService extends ServicesInterface {
  /**
   * Define the API endpoints for this service.
   */
  protected abstract get endpoints(): ApiEndpoints;

  /**
   * Default options applied to all requests.
   */
  protected get defaultOptions(): Partial<ApiCallOptions> {
    return {
      auth: true,
      showLoadingDialog: false,
      showErrorDialog: false,
      enableRetry: env.isRetryEnabled,
    };
  }

  /**
   * Resolves a string endpoint.
   */
  private resolveEndpoint(endpoint: string | undefined): string {
    if (!endpoint) {
      throw new Error('Endpoint not configured');
    }
    return endpoint;
  }

  /**
   * Merge options with defaults
   */
  private mergeOptions(options?: ApiCallOptions): ApiCallOptions {
    return {
      ...this.defaultOptions,
      ...options,
    };
  }

  // =========================================================================
  // CRUD Operations
  // =========================================================================

  /**
   * Fetch list of items (POST request with Params in body).
   */
  async index(
    params?: Params,
    options?: ApiCallOptions,
    isAutoRetry?: boolean,
  ): Promise<ApiResponse> {
    const url = this.resolveEndpoint(this.endpoints.index);

    const mergedOptions = this.mergeOptions({
      ...options,
      enableRetry: isAutoRetry,
      usePost: options?.usePost ?? true,
    });
    return this.call({
      url,
      type: mergedOptions?.usePost ? CrudType.POST : CrudType.GET,
      params,
      ...mergedOptions,
    });
  }

  /**
   * Fetch single item (POST request with Params in body).
   * The ID should be included in the Params.
   */
  async show(
    params?: Params,
    options?: ApiCallOptions,
    isAutoRetry?: boolean,
  ): Promise<ApiResponse> {
    const url = this.resolveEndpoint(this.endpoints.show);
    const mergedOptions = this.mergeOptions({
      ...options,
      enableRetry: isAutoRetry,
      usePost: options?.usePost ?? true,
    });

    return this.call({
      url,
      type: mergedOptions?.usePost ? CrudType.POST : CrudType.GET,
      params,
      ...mergedOptions,
    });
  }

  /**
   * Create new item (POST request with FormData or JSON).
   */
  async create(
    params: Params,
    options?: ApiCallOptions,
    isAutoRetry?: boolean,
  ): Promise<ApiResponse> {
    const url = this.resolveEndpoint(this.endpoints.create);

    const mergedOptions = this.mergeOptions({
      ...options,
      enableRetry: isAutoRetry,
    });

    return this.call({
      url,
      type: mergedOptions.useJson ? CrudType.POST : CrudType.FormData,
      params,
      ...mergedOptions,
    });
  }

  /**
   * Update existing item (POST request with Params in body).
   * The ID should be included in the Params.
   */
  async update(
    params?: Params,
    options?: ApiCallOptions,
    isAutoRetry?: boolean,
  ): Promise<ApiResponse> {
    const url = this.resolveEndpoint(this.endpoints.update);
    const mergedOptions = this.mergeOptions({
      ...options,
      enableRetry: isAutoRetry,
      usePost: options?.usePost ?? true,
    });

    let method: CrudType = CrudType.FormData;
    if (mergedOptions.usePut) {
      method = CrudType.PUT;
    } else if (mergedOptions.useJson) {
      method = CrudType.PATCH;
    }

    return this.call({
      url,
      type: mergedOptions?.usePost ? CrudType.POST : method,
      params,
      ...mergedOptions,
    });
  }

  /**
   * Delete item (POST request with Params in body).
   * The ID should be included in the Params.
   */
  async delete(params?: Params, options?: ApiCallOptions): Promise<ApiResponse> {
    const url = this.resolveEndpoint(this.endpoints.delete);
    const mergedOptions = this.mergeOptions({
      ...options,
      usePost: options?.usePost ?? true,
    });

    return this.call({
      url,
      type: mergedOptions?.usePost ? CrudType.POST : CrudType.DELETE,
      params,
      ...mergedOptions,
    });
  }

  // =========================================================================
  // Custom Endpoint Support
  // =========================================================================

  /**
   * Execute a custom API call for non-CRUD operations.
   */
  async custom<T = any>(
    config: CustomEndpointConfig,
    options?: ApiCallOptions,
    isAutoRetry?: boolean,
  ): Promise<ApiResponse<T>> {
    const mergedOptions = this.mergeOptions({
      ...options,
      enableRetry: isAutoRetry,
    });

    return this.call({
      url: config.url,
      type: config.method,
      params: config.params,
      details: config.queryParams,
      headers: config.headers,
      showErrorDialog: mergedOptions.showErrorDialog,
      showLoadingDialog: mergedOptions.showLoadingDialog,
      ...mergedOptions,
    }) as Promise<ApiResponse<T>>;
  }

  /**
   * Execute a custom GET request.
   */
  async customGet<T = any>(
    url: string,
    queryParams?: Record<string, any>,
    options?: ApiCallOptions,
  ): Promise<ApiResponse<T>> {
    return this.custom<T>({ url, method: CrudType.GET, queryParams }, options);
  }

  /**
   * Execute a custom POST request.
   */
  async customPost<T = any>(
    url: string,
    params?: Params,
    options?: ApiCallOptions,
  ): Promise<ApiResponse<T>> {
    return this.custom<T>({ url, method: CrudType.POST, params }, options);
  }

  // =========================================================================
  // Batch Operations
  // =========================================================================

  /**
   * Execute multiple requests in parallel.
   */
  async batch(
    requests: Array<{ config: CustomEndpointConfig; options?: ApiCallOptions }>,
  ): Promise<ApiResponse[]> {
    const promises = requests.map(({ config, options }) => this.custom(config, options));

    return Promise.all(promises);
  }

  /**
   * Execute multiple requests sequentially.
   */
  async batchSequential(
    requests: Array<{ config: CustomEndpointConfig; options?: ApiCallOptions }>,
  ): Promise<ApiResponse[]> {
    const results: ApiResponse[] = [];

    for (const { config, options } of requests) {
      const result = await this.custom(config, options);
      results.push(result);
    }

    return results;
  }

  // =========================================================================
  // Retry Operations
  // =========================================================================

  /**
   * Execute request with retry logic.
   */
  async withRetry<T = any>(
    fn: () => Promise<ApiResponse<T>>,
    config?: Partial<RetryConfig>,
  ): Promise<ApiResponse<T>> {
    const retryConfig: RetryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...config,
    };

    let lastError: Error | undefined;
    let delay = retryConfig.initialDelay;

    for (let attempt = 0; attempt < retryConfig.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;

        // Don't retry on non-retryable errors
        if (!error.isRetryable) {
          throw error;
        }

        // Wait before retrying
        if (attempt < retryConfig.maxAttempts - 1) {
          if (env.isLoggingEnabled) {
            // console.log(`[BaseApiService] Retry attempt ${attempt + 1}/${retryConfig.maxAttempts}`);
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= retryConfig.backoffMultiplier;
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  // =========================================================================
  // Progress Operations
  // =========================================================================

  /**
   * Upload with progress tracking.
   */
  async uploadWithProgress(
    url: string,
    params: Params,
    onProgress: ProgressCallback,
    options?: ApiCallOptions,
  ): Promise<ApiResponse> {
    return this.call({
      url,
      type: CrudType.FormData,
      params,
      onUploadProgress: onProgress,
      ...this.mergeOptions(options),
    });
  }

  /**
   * Download with progress tracking.
   */
  async downloadWithProgress(
    url: string,
    onProgress: ProgressCallback,
    options?: ApiCallOptions,
  ): Promise<ApiResponse> {
    return this.call({
      url,
      type: CrudType.GET,
      onDownloadProgress: onProgress,
      ...this.mergeOptions(options),
    });
  }

  // =========================================================================
  // Legacy Compatibility
  // =========================================================================

  /**
   * Legacy compatibility: implements abstract method from ServicesInterface.
   * Use specific CRUD methods instead.
   * @deprecated
   */
  async applyService(params: Params): Promise<ApiResponse> {
    return this.index(params);
  }
}

export { type ApiResponse, CrudType };
