/**
 * Network Service
 * Enhanced HTTP client with timeout, progress, cancellation, and retry support
 */

import type {
  AxiosInstance,
  AxiosResponse,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import axios from 'axios';
import HeaderHandler from '@/base/Core/NetworkStructure/networking/utils/headerHandler';
import type PostParams from '@/base/Core/Params/postParams';
import type GetParams from '@/base/Core/Params/getParams';
import { env } from '@/base/Core/Config';
import ErrorHandler from '@/base/Core/NetworkStructure/errors/errorHandler';
import type { RetryOptions } from '@/base/Core/Config/environment.types';
import { DEFAULT_RETRY_OPTIONS } from '@/base/Core/Config/environment.types';

/**
 * Progress event callback type
 */
export type ProgressCallback = (event: {
  loaded: number;
  total?: number;
  progress: number;
}) => void;

/**
 * Extended request configuration
 */
export interface NetworkRequestConfig {
  /** Override default timeout */
  timeout?: number;

  /** AbortController signal for cancellation */
  signal?: AbortSignal;

  /** Upload progress callback */
  onUploadProgress?: ProgressCallback;

  /** Download progress callback */
  onDownloadProgress?: ProgressCallback;

  /** Enable retry for this request */
  enableRetry?: boolean;

  /** Retry options override */
  retryOptions?: Partial<RetryOptions>;
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * NetworkService - Enhanced HTTP client singleton
 */
export default class NetworkService {
  private axiosInstance: AxiosInstance;
  private static _instance: NetworkService;

  /** Active request controllers for cancellation */
  private activeRequests: Map<string, AbortController> = new Map();

  private constructor() {
    this.axiosInstance = this.createAxiosInstance();
    this.setupInterceptors();
  }

  /**
   * Get singleton instance
   */
  static get instance(): NetworkService {
    if (!this._instance) {
      this._instance = new NetworkService();
    }
    return this._instance;
  }

  /**
   * Create configured Axios instance
   */
  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: env.apiBaseUrl,
      timeout: env.timeout,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  /**
   * Setup request/response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Generate request ID for tracking
        const requestId = generateRequestId();
        (config as any).__requestId = requestId;
        (config as any).__startTime = Date.now();

        // Log request if enabled
        if (env.isLoggingEnabled) {
          // console.log(`[Network] [${requestId}] ${config.method?.toUpperCase()} ${config.url}`, {
          //   params: config.params,
          //   data: config.data,
          // });
        }

        return config;
      },
      (error) => {
        if (env.isLoggingEnabled) {
          console.error('[Network] Request Error:', error);
        }
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // const requestId = (response.config as any).__requestId;
        // const startTime = (response.config as any).__startTime;
        // const duration = Date.now() - (startTime || Date.now());

        // Log response if enabled
        if (env.isLoggingEnabled) {
          // console.log(`[Network] [${requestId}] Response (${duration}ms) ${response.status}`, {
          //   data: response.data,
          // });
        }

        return response;
      },
      (error) => {
        const requestId = (error.config as any)?.__requestId || 'unknown';
        const startTime = (error.config as any)?.__startTime;
        const duration = Date.now() - (startTime || Date.now());

        // Log error if enabled
        if (env.isLoggingEnabled) {
          console.error(`[Network] [${requestId}] Error (${duration}ms):`, {
            status: error.response?.status,
            message: error.message,
            url: error.config?.url,
          });
        }

        return Promise.reject(error);
      },
    );
  }

  /**
   * Update base URL (e.g., when environment changes)
   */
  updateBaseUrl(baseUrl: string): void {
    this.axiosInstance.defaults.baseURL = baseUrl;
  }

  /**
   * Create AbortController for request cancellation
   */
  createAbortController(requestId?: string): AbortController {
    const controller = new AbortController();

    if (requestId) {
      this.activeRequests.set(requestId, controller);
    }

    return controller;
  }

  /**
   * Cancel a specific request by ID
   */
  cancelRequest(requestId: string): void {
    const controller = this.activeRequests.get(requestId);
    if (controller) {
      controller.abort();
      this.activeRequests.delete(requestId);
    }
  }

  /**
   * Cancel all active requests
   */
  cancelAllRequests(): void {
    this.activeRequests.forEach((controller) => {
      controller.abort();
    });
    this.activeRequests.clear();
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    options: Partial<RetryOptions> = {},
  ): Promise<AxiosResponse<T>> {
    const retryOptions: RetryOptions = {
      ...DEFAULT_RETRY_OPTIONS,
      ...options,
      maxAttempts: options.maxAttempts ?? env.maxRetryAttempts,
      initialDelay: options.initialDelay ?? env.retryDelay,
    };

    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt < retryOptions.maxAttempts) {
      try {
        return await requestFn();
      } catch (error: any) {
        lastError = error;

        // Check if error is retryable
        if (!ErrorHandler.isRetryable(error)) {
          throw error;
        }

        // Check if we should retry
        attempt++;
        if (attempt >= retryOptions.maxAttempts) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = ErrorHandler.getRetryDelay(
          attempt - 1,
          retryOptions.initialDelay,
          retryOptions.maxDelay,
        );

        if (env.isLoggingEnabled) {
          // console.log(
          //   `[Network] Retry attempt ${attempt}/${retryOptions.maxAttempts} after ${delay}ms`,
          // );
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  /**
   * Build Axios request config
   */
  private buildConfig(
    isAuth: boolean,
    headers?: Record<string, string>,
    queryParams?: Record<string, any>,
    networkConfig?: NetworkRequestConfig,
  ): AxiosRequestConfig {
    return {
      headers: { ...HeaderHandler.Instance.getHeader(isAuth), ...headers },
      params: queryParams,
      timeout: networkConfig?.timeout ?? env.timeout,
      signal: networkConfig?.signal,
      onUploadProgress: networkConfig?.onUploadProgress
        ? (event) => {
            const progress = event.total ? Math.round((event.loaded * 100) / event.total) : 0;
            networkConfig.onUploadProgress!({
              loaded: event.loaded,
              total: event.total,
              progress,
            });
          }
        : undefined,
      onDownloadProgress: networkConfig?.onDownloadProgress
        ? (event) => {
            const progress = event.total ? Math.round((event.loaded * 100) / event.total) : 0;
            networkConfig.onDownloadProgress!({
              loaded: event.loaded,
              total: event.total,
              progress,
            });
          }
        : undefined,
    };
  }

  // =========================================================================
  // HTTP Methods
  // =========================================================================

  /**
   * POST request
   */
  async post(
    { url, data, headers, queryParams, isAuth = false }: PostParams,
    networkConfig?: NetworkRequestConfig,
  ): Promise<AxiosResponse> {
    const config = this.buildConfig(isAuth, headers, queryParams, networkConfig);

    const requestFn = () => this.axiosInstance.post(url, data, config);

    if (env.isRetryEnabled && networkConfig?.enableRetry !== false) {
      return this.executeWithRetry(requestFn, networkConfig?.retryOptions);
    }

    return requestFn();
  }

  /**
   * POST request with FormData
   */
  async postFormData(
    { url, data, headers, queryParams, isAuth = false }: PostParams,
    networkConfig?: NetworkRequestConfig,
  ): Promise<AxiosResponse> {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (item instanceof File) {
              formData.append(`${key}[${index}]`, item);
            } else {
              formData.append(`${key}[${index}]`, String(item));
            }
          });
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const config = this.buildConfig(isAuth, headers, queryParams, networkConfig);
    config.headers = {
      ...config.headers,
      'Content-Type': 'multipart/form-data',
    };

    const requestFn = () => this.axiosInstance.post(url, formData, config);

    if (env.isRetryEnabled && networkConfig?.enableRetry !== false) {
      return this.executeWithRetry(requestFn, networkConfig?.retryOptions);
    }

    return requestFn();
  }

  /**
   * GET request
   */
  async get(
    { url, headers, queryParams, isAuth = false }: GetParams,
    networkConfig?: NetworkRequestConfig,
  ): Promise<AxiosResponse> {
    const config = this.buildConfig(isAuth, headers, queryParams, networkConfig);

    const requestFn = () => this.axiosInstance.get(url, config);

    if (env.isRetryEnabled && networkConfig?.enableRetry !== false) {
      return this.executeWithRetry(requestFn, networkConfig?.retryOptions);
    }

    return requestFn();
  }

  /**
   * DELETE request
   */
  async delete(
    { url, headers, queryParams, isAuth = false }: GetParams,
    networkConfig?: NetworkRequestConfig,
  ): Promise<AxiosResponse> {
    const config = this.buildConfig(isAuth, headers, queryParams, networkConfig);

    const requestFn = () => this.axiosInstance.delete(url, config);

    if (env.isRetryEnabled && networkConfig?.enableRetry !== false) {
      return this.executeWithRetry(requestFn, networkConfig?.retryOptions);
    }

    return requestFn();
  }

  /**
   * PUT request
   */
  async put(
    { url, data, headers, queryParams, isAuth = false }: PostParams,
    networkConfig?: NetworkRequestConfig,
  ): Promise<AxiosResponse> {
    const config = this.buildConfig(isAuth, headers, queryParams, networkConfig);

    const requestFn = () => this.axiosInstance.put(url, data, config);

    if (env.isRetryEnabled && networkConfig?.enableRetry !== false) {
      return this.executeWithRetry(requestFn, networkConfig?.retryOptions);
    }

    return requestFn();
  }

  /**
   * PATCH request
   */
  async patch(
    { url, data, headers, queryParams, isAuth = false }: PostParams,
    networkConfig?: NetworkRequestConfig,
  ): Promise<AxiosResponse> {
    const config = this.buildConfig(isAuth, headers, queryParams, networkConfig);

    const requestFn = () => this.axiosInstance.patch(url, data, config);

    if (env.isRetryEnabled && networkConfig?.enableRetry !== false) {
      return this.executeWithRetry(requestFn, networkConfig?.retryOptions);
    }

    return requestFn();
  }

  // =========================================================================
  // Utility Methods
  // =========================================================================

  /**
   * Check if network is available (browser API)
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Get Axios instance for advanced usage
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}
