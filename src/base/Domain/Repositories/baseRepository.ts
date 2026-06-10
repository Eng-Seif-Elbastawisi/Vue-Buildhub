import {
  DataEmpty,
  DataFailed,
  type DataState,
  DataSuccess,
  DataTimeout,
  DataNoNetwork,
  DataCancelled,
  DataRateLimited,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type Params from '@/base/Core/Params/params';
import { HttpStatusCode } from 'axios';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import type BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiCallOptions, ApiResponse } from '@/base/Data/ApiService/baseApiService';
import PaginationModel from '@/base/Core/Models/paginationModel';
import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GatewayTimeoutException,
  InternalServerException,
  MethodNotAllowedException,
  NetworkDisconnectException,
  NotFoundException,
  NotImplementedException,
  RequestTimeoutException,
  ServiceUnavailableException,
  UnAuthorizedException,
  RateLimitException,
  CancelledRequestException,
  ValidationException,
} from '@/base/Core/Constants/exceptionConstants';
import { env } from '@/base/Core/Config';
import ErrorHandler from '@/base/Core/NetworkStructure/errors/errorHandler';

/**
 * Configuration for repository response parsing.
 */
export interface RepositoryConfig {
  /** Whether responses include pagination metadata */
  hasPagination?: boolean;

  /** Whether to parse response data (false for void operations like delete) */
  parseResponse?: boolean;

  /** Data key in response (default: 'data') */
  dataKey?: string;

  /** Pagination key in response (default: 'meta') */
  paginationKey?: string;
}

/**
 * Execute options for custom operations
 */
export interface ExecuteOptions {
  /** Enable retry for failed requests */
  enableRetry?: boolean;

  /** Store retry function for UI retry buttons */
  captureRetryFn?: boolean;
}

/**
 * Base Repository providing unified CRUD operations with DataState handling.
 * Extend this class and define the API service + parsing logic for feature-specific repositories.
 *
 * @example
 * ```typescript
 * class ProductRepository extends BaseRepository<ProductModel, ProductModel[]> {
 *   protected get apiService() { return ProductApiService.getInstance(); }
 *
 *   protected parseItem(data: unknown): ProductModel {
 *     return ProductModel.fromMap(data);
 *   }
 *
 *   protected parseList(data: unknown): ProductModel[] {
 *     return data.map((item: any) => ProductModel.fromMap(item));
 *   }
 *
 *   // Add custom operations
 *   async getStats(productId: string): Promise<DataState<ProductStats>> {
 *     return this.executeCustom(
 *       () => this.apiService.customGet(`/api/products/${productId}/stats`),
 *       (data) => ProductStats.fromMap(data)
 *     );
 *   }
 * }
 * ```
 */
export default abstract class BaseRepository<T, TList = T[]> {
  /**
   * The API service instance for making HTTP calls.
   */
  protected abstract get apiService(): BaseApiService;

  /**
   * Parse a single item from API response data.
   */
  protected abstract parseItem(data: unknown): T;

  /**
   * Parse a list of items from API response data.
   */
  protected abstract parseList(data: unknown): TList;

  /**
   * Default configuration for the repository.
   */
  protected get config(): RepositoryConfig {
    return {
      hasPagination: false,
      parseResponse: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  /**
   * Mock single item returned in test mode instead of making an API call.
   * Override in subclass when useStaticData / isTest is enabled.
   */
  protected get mockItem(): T {
    throw new Error(`${this.constructor.name}: mockItem not implemented for test mode`);
  }

  /**
   * Mock list returned in test mode instead of making an API call.
   * Override in subclass when useStaticData / isTest is enabled.
   */
  protected get mockList(): TList {
    throw new Error(`${this.constructor.name}: mockList not implemented for test mode`);
  }

  // =========================================================================
  // CRUD Operations
  // =========================================================================

  /**
   * Fetch list of items with optional pagination.
   */
  async index(
    params?: Params,
    options?: ApiCallOptions,
    isAutoRetry?: boolean,
  ): Promise<DataState<TList>> {
    if (options?.useStaticData ?? env.useStaticData) {
      return new DataSuccess<TList>({ data: this.mockList });
    }

    const retryFn = () => this.index(params, options, isAutoRetry);

    try {
      const httpResponse = await this.apiService.index(params, options, isAutoRetry);
      return this.processListResponse(httpResponse, retryFn);
    } catch (error) {
      return this.handleError(error, retryFn);
    }
  }

  /**
   * Fetch single item by ID.
   */
  async show(params?: Params, options?: ApiCallOptions , isAutoRetry?: boolean): Promise<DataState<T>> {
    if (options?.useStaticData ?? env.useStaticData) {
      return new DataSuccess<T>({ data: this.mockItem });
    }

    const retryFn = () => this.show(params, options , isAutoRetry);

    try {
      const httpResponse = await this.apiService.show(params, options ,isAutoRetry);
      return this.processItemResponse(httpResponse, retryFn);
    } catch (error) {
      return this.handleError(error, retryFn);
    }
  }

  /**
   * Create new item.
   */
  async create(
    params: Params,
    options?: ApiCallOptions,
    isAutoRetry?: boolean,
  ): Promise<DataState<T>> {
    if (options?.useStaticData ?? env.useStaticData) {
      return new DataSuccess<T>({ data: this.mockItem });
    }

    const retryFn = () => this.create(params, options);

    try {
      const httpResponse = await this.apiService.create(params, options, isAutoRetry);
      return this.processItemResponse(httpResponse, retryFn);
    } catch (error) {
      return this.handleError(error, retryFn);
    }
  }

  /**
   * Update existing item.
   */
  async update(
    params?: Params,
    options?: ApiCallOptions,
    isAutoRetry?: boolean,
  ): Promise<DataState<T>> {
    if (options?.useStaticData ?? env.useStaticData) {
      return new DataSuccess<T>({ data: this.mockItem });
    }

    const retryFn = () => this.update(params, options);

    try {
      const httpResponse = await this.apiService.update(params, options, isAutoRetry);
      return this.processItemResponse(httpResponse, retryFn);
    } catch (error) {
      return this.handleError(error, retryFn);
    }
  }

  /**
   * Delete item by ID.
   */
  async delete(params?: Params, options?: ApiCallOptions): Promise<DataState<void>> {
    if (options?.useStaticData ?? env.useStaticData) {
      return new DataSuccess<void>({});
    }

    const retryFn = () => this.delete(params, options);

    try {
      const httpResponse = await this.apiService.delete(params, options);
      return this.processVoidResponse(httpResponse);
    } catch (error) {
      return this.handleError(error, retryFn);
    }
  }

  // =========================================================================
  // Custom Operations
  // =========================================================================

  /**
   * Execute a custom API call with custom response parsing.
   * Use this for non-CRUD operations.
   */
  protected async executeCustom<R>(
    apiCall: () => Promise<ApiResponse>,
    parser: (data: any) => R,
    options?: ExecuteOptions,
  ): Promise<DataState<R>> {
    const retryFn =
      options?.captureRetryFn !== false
        ? () => this.executeCustom(apiCall, parser, options)
        : undefined;

    try {
      const httpResponse = await apiCall();
      const isSuccess = this.isSuccessStatus(httpResponse.statusCode, httpResponse.data);

      if (isSuccess && httpResponse.data.data != null) {
        return new DataSuccess<R>({
          data: parser(httpResponse.data.data),
          message: httpResponse.data.message,
        });
      }

      return new DataFailed({
        error: new ErrorModel(httpResponse.data.message ?? 'Unknown error', ErrorType.serviceSide),
      });
    } catch (error) {
      return this.handleError(error, retryFn);
    }
  }

  /**
   * Execute custom with retry support.
   */
  protected async executeWithRetry<R>(
    apiCall: () => Promise<ApiResponse>,
    parser: (data: any) => R,
    maxAttempts: number = 3,
  ): Promise<DataState<R>> {
    let lastError: any;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await this.executeCustom(apiCall, parser, {
          captureRetryFn: false,
        });
      } catch (error: any) {
        lastError = error;

        if (!ErrorHandler.isRetryable(error)) {
          break;
        }

        if (attempt < maxAttempts - 1) {
          const delay = ErrorHandler.getRetryDelay(attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    return this.handleError(lastError);
  }

  // =========================================================================
  // Response Processing
  // =========================================================================

  /**
   * Check if HTTP response indicates success.
   */
  private isSuccessStatus(statusCode: number, data: any): boolean {
    return (
      [HttpStatusCode.Ok, HttpStatusCode.Created, HttpStatusCode.Accepted].includes(statusCode) &&
      (data.status ?? true)
    );
  }

  /**
   * Process response for list operations (index).
   */
  private processListResponse(
    httpResponse: ApiResponse,
    _retryFn?: () => Promise<DataState<TList>>,
  ): DataState<TList> {
    const isSuccess = this.isSuccessStatus(httpResponse.statusCode, httpResponse.data);

    if (isSuccess) {
      const dataKey = this.config.dataKey || 'data';
      const paginationKey = this.config.paginationKey || 'meta';

      if (httpResponse.data[dataKey] != null) {
        try {
          let pagination: PaginationModel | null = null;
          let rawData = httpResponse.data[dataKey];

          // Handle nested pagination structure
          if (this.config.hasPagination && httpResponse.data[dataKey][paginationKey]) {
            const paginatedData = httpResponse.data[dataKey];

            if (paginatedData.data?.length === 0) {
              return new DataEmpty<TList>(
                new ErrorModel(httpResponse.data.message ?? '', ErrorType.dataEmpty),
              );
            }

            pagination = PaginationModel.fromMap(paginatedData[paginationKey]);
            rawData = paginatedData.data ?? paginatedData;
          }

          if (Array.isArray(rawData) && rawData.length === 0) {
            return new DataSuccess<TList>({
              data: null,
              pagination,
              message: httpResponse.data.message,
            });
          }

          return new DataSuccess<TList>({
            data: this.parseList(rawData),
            pagination,
            message: httpResponse.data.message,
          });
        } catch (e) {
          if (env.isLoggingEnabled) {
            console.error('Error parsing list data from Repository', e);
          }
          return new DataFailed({
            error: new ErrorModel(httpResponse.data.message ?? '', ErrorType.dataDirty),
          });
        }
      } else {
        return new DataEmpty<TList>(
          new ErrorModel(httpResponse.data.message ?? 'No data', ErrorType.dataEmpty),
        );
      }
    }

    return new DataFailed({
      error: new ErrorModel(httpResponse.data.message ?? '', ErrorType.serviceSide),
    });
  }

  /**
   * Process response for single item operations (show, create, update).
   */
  private processItemResponse(
    httpResponse: ApiResponse,
    _retryFn?: () => Promise<DataState<T>>,
  ): DataState<T> {
    const isSuccess = this.isSuccessStatus(httpResponse.statusCode, httpResponse.data);
    const dataKey = this.config.dataKey || 'data';

    if (isSuccess) {
      if (httpResponse.data[dataKey] != null) {
        try {
          return new DataSuccess<T>({
            data: this.parseItem(httpResponse.data[dataKey]),
            message: httpResponse.data.message,
          });
        } catch (e) {
          if (env.isLoggingEnabled) {
            console.error('Error parsing item data from Repository', e);
          }
          return new DataFailed({
            error: new ErrorModel(httpResponse.data.message ?? '', ErrorType.dataDirty),
          });
        }
      }
      // Success without data (valid for some operations)
      return new DataSuccess<T>({
        message: httpResponse.data.message,
      });
    }

    return new DataFailed({
      error: new ErrorModel(httpResponse.data.message ?? '', ErrorType.serviceSide),
    });
  }

  /**
   * Process response for void operations (delete).
   */
  private processVoidResponse(httpResponse: ApiResponse): DataState<void> {
    const isSuccess = this.isSuccessStatus(httpResponse.statusCode, httpResponse.data);

    if (isSuccess) {
      return new DataSuccess<void>({
        message: httpResponse.data.message,
      });
    }

    return new DataFailed({
      error: new ErrorModel(httpResponse.data.message ?? '', ErrorType.serviceSide),
    });
  }

  // =========================================================================
  // Error Handling
  // =========================================================================

  /**
   * Handle different exception types and convert to appropriate DataState.
   */
  protected handleError<R>(error: any, retryFn?: () => Promise<DataState<R>>): DataState<R> {
    // Log error
    if (env.isLoggingEnabled) {
      ErrorHandler.logError(error, 'Repository');
    }

    // Handle timeout
    if (error instanceof RequestTimeoutException || ErrorHandler.isTimeout(error)) {
      return new DataTimeout<R>(retryFn);
    }

    // Handle network disconnection
    if (error instanceof NetworkDisconnectException || ErrorHandler.isNetworkError(error)) {
      return new DataNoNetwork<R>(retryFn);
    }

    // Handle cancelled request
    if (error instanceof CancelledRequestException) {
      return new DataCancelled<R>();
    }

    // Handle rate limiting
    if (error instanceof RateLimitException) {
      return new DataRateLimited<R>(error.retryAfter, retryFn);
    }

    // Handle specific exception types
    if (error instanceof BadRequestException) {
      return new DataFailed({
        error: new ErrorModel(error.message, ErrorType.badRequest),
      });
    }

    if (error instanceof UnAuthorizedException) {
      return new DataFailed({
        error: new ErrorModel(error.message, ErrorType.unAuthorized),
      });
    }

    if (error instanceof ForbiddenException) {
      return new DataFailed({
        error: new ErrorModel(error.message, ErrorType.forbidden),
      });
    }

    if (error instanceof NotFoundException) {
      return new DataFailed({
        error: new ErrorModel(error.message, ErrorType.notFound),
      });
    }

    if (error instanceof MethodNotAllowedException) {
      return new DataFailed({
        error: new ErrorModel(error.message, ErrorType.methodNotAllowed),
      });
    }

    if (error instanceof ValidationException) {
      return new DataFailed({
        error: new ErrorModel(error.message, ErrorType.validation, {
          validationErrors: error.errors,
        }),
      });
    }

    if (error instanceof ConflictException) {
      return new DataFailed({
        error: new ErrorModel(error.message, ErrorType.conflict),
      });
    }

    if (
      error instanceof InternalServerException ||
      error instanceof NotImplementedException ||
      error instanceof BadGatewayException ||
      error instanceof ServiceUnavailableException ||
      error instanceof GatewayTimeoutException
    ) {
      return new DataFailed({
        error: new ErrorModel(error.message, ErrorType.serviceSide),
      });
    }

    // Unknown error
    return new DataFailed({
      error: new ErrorModel(error?.message ?? 'Unknown error', ErrorType.unknown),
    });
  }
}
