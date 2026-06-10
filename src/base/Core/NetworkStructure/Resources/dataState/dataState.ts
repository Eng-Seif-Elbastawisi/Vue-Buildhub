/**
 * Data State Types
 * Represents all possible states for async data operations
 */

import { ErrorModel, ErrorType } from '../errors/errorModel';
import type { Data_state_params } from './data_state_params/dataStateParams';
import type ValidationModel from '@/base/Core/NetworkStructure/Resources/validations/validationModel';
import type PaginationModel from '@/base/Core/Models/paginationModel';
import type DataSuccessParams from '@/base/Core/NetworkStructure/Resources/dataState/data_state_params/dataSuccessParams';
import type DataFailedParams from '@/base/Core/NetworkStructure/Resources/dataState/data_state_params/dataFailedParams';

/**
 * Abstract base class for all data states
 */
abstract class DataState<T> {
  /** The actual data payload */
  public data: T | null = null;

  /** Search/filtered data subset */
  public searchData: T | null = null;

  /** Error information if failed */
  public error: ErrorModel | null = null;

  /** Status message from server */
  public message: string | null = null;

  /** Pagination metadata */
  public pagination: PaginationModel | null = null;

  /** Validation state */
  public validation: ValidationModel | null = null;

  protected constructor({
    data = null,
    searchData = null,
    error = null,
    message = null,
    pagination = null,
    validation = null,
  }: Data_state_params<T> = {}) {
    this.data = data ?? null;
    this.searchData = searchData ?? null;
    this.error = error ?? null;
    this.message = message ?? null;
    this.pagination = pagination ?? null;
    this.validation = validation ?? null;
  }

  /**
   * Check if this state has data
   */
  get hasData(): boolean {
    return this.data !== null;
  }

  /**
   * Check if this state has an error
   */
  get hasError(): boolean {
    return this.error !== null;
  }

  /**
   * Check if this state is retryable
   */
  get isRetryable(): boolean {
    return this.error?.isRetryable ?? false;
  }
}

/**
 * Successful data state
 */
class DataSuccess<T> extends DataState<T> {
  constructor({
    data = null,
    searchData = null,
    pagination = null,
    message = null,
  }: DataSuccessParams<T>) {
    super({
      data: data,
      pagination: pagination,
      searchData: searchData,
      message: message,
    });
  }
}

/**
 * Failed data state
 */
class DataFailed<T> extends DataState<T> {
  constructor({ error }: DataFailedParams) {
    super({ error });
  }
}

/**
 * Loading state
 */
class DataLoading<T> extends DataState<T> {
  constructor() {
    super();
  }
}

/**
 * Initial/idle state
 */
class DataInitial<T> extends DataState<T> {
  constructor(initialState: T | null = null) {
    super({ data: initialState });
  }
}

/**
 * Dump state (for cached/stale data)
 */
class DataDump<T> extends DataState<T> {
  constructor(data: T | null = null, searchData: T | null = null, message: string | null = null) {
    super({ data, searchData, message });
  }
}

/**
 * Empty data state
 */
class DataEmpty<T> extends DataState<T> {
  constructor(error: ErrorModel) {
    super({ error });
  }
}

/**
 * Validation state
 */
class DataValid<T> extends DataState<T> {
  constructor(validation: ValidationModel) {
    super({ validation });
  }
}

// ============================================================================
// NEW STATES
// ============================================================================

/**
 * Request timeout state
 * Includes retry function for user-initiated retry
 */
class DataTimeout<T> extends DataState<T> {
  /** Retry function to attempt the request again */
  public retryFn?: () => Promise<DataState<T>>;

  constructor(retryFn?: () => Promise<DataState<T>>) {
    super({
      error: new ErrorModel('Request timed out', ErrorType.timeout),
    });
    this.retryFn = retryFn;
  }

  /**
   * Execute retry if available
   */
  async retry(): Promise<DataState<T> | null> {
    if (this.retryFn) {
      return await this.retryFn();
    }
    return null;
  }
}

/**
 * No network connection state
 * Includes retry function for user-initiated retry
 */
class DataNoNetwork<T> extends DataState<T> {
  /** Retry function to attempt the request again */
  public retryFn?: () => Promise<DataState<T>>;

  constructor(retryFn?: () => Promise<DataState<T>>) {
    super({
      error: new ErrorModel('No network connection', ErrorType.networkConnection),
    });
    this.retryFn = retryFn;
  }

  /**
   * Execute retry if available
   */
  async retry(): Promise<DataState<T> | null> {
    if (this.retryFn) {
      return await this.retryFn();
    }
    return null;
  }
}

/**
 * Request cancelled state
 */
class DataCancelled<T> extends DataState<T> {
  constructor() {
    super({
      error: new ErrorModel('Request cancelled', ErrorType.cancelled),
    });
  }
}

/**
 * Progress state for upload/download operations
 */
class DataProgress<T> extends DataState<T> {
  /** Progress percentage (0-100) */
  public progress: number;

  /** Total bytes (if known) */
  public total?: number;

  /** Loaded/uploaded bytes */
  public loaded?: number;

  constructor(progress: number, total?: number, loaded?: number) {
    super();
    this.progress = Math.min(Math.max(progress, 0), 100);
    this.total = total;
    this.loaded = loaded;
  }

  /**
   * Check if progress is complete
   */
  get isComplete(): boolean {
    return this.progress >= 100;
  }

  /**
   * Get progress as fraction (0-1)
   */
  get progressFraction(): number {
    return this.progress / 100;
  }

  /**
   * Format progress for display
   */
  get displayProgress(): string {
    return `${Math.round(this.progress)}%`;
  }
}

/**
 * Rate limited state (too many requests)
 */
class DataRateLimited<T> extends DataState<T> {
  /** Seconds until retry is allowed */
  public retryAfter?: number;

  /** Retry function */
  public retryFn?: () => Promise<DataState<T>>;

  constructor(retryAfter?: number, retryFn?: () => Promise<DataState<T>>) {
    super({
      error: new ErrorModel('Too many requests', ErrorType.rateLimit),
    });
    this.retryAfter = retryAfter;
    this.retryFn = retryFn;
  }

  /**
   * Execute retry after delay
   */
  async retryAfterDelay(): Promise<DataState<T> | null> {
    if (this.retryFn) {
      if (this.retryAfter) {
        await new Promise((resolve) => setTimeout(resolve, this.retryAfter! * 1000));
      }
      return await this.retryFn();
    }
    return null;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Type guard to check if state is successful
 */
function isDataSuccess<T>(state: DataState<T>): state is DataSuccess<T> {
  return state instanceof DataSuccess;
}

/**
 * Type guard to check if state is failed
 */
function isDataFailed<T>(state: DataState<T>): state is DataFailed<T> {
  return state instanceof DataFailed;
}

/**
 * Type guard to check if state is loading
 */
function isDataLoading<T>(state: DataState<T>): state is DataLoading<T> {
  return state instanceof DataLoading;
}

/**
 * Type guard to check if state represents an error condition
 */
function isErrorState<T>(state: DataState<T>): boolean {
  return (
    state instanceof DataFailed ||
    state instanceof DataTimeout ||
    state instanceof DataNoNetwork ||
    state instanceof DataRateLimited ||
    state instanceof DataEmpty
  );
}

/**
 * Type guard to check if state is retryable
 */
function isRetryableState<T>(state: DataState<T>): boolean {
  return (
    state instanceof DataTimeout ||
    state instanceof DataNoNetwork ||
    state instanceof DataRateLimited ||
    (state instanceof DataFailed && state.error?.isRetryable === true)
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Base class
  DataState,

  // Core states
  DataSuccess,
  DataFailed,
  DataLoading,
  DataInitial,
  DataDump,
  DataEmpty,
  DataValid,

  // New states
  DataTimeout,
  DataNoNetwork,
  DataCancelled,
  DataProgress,
  DataRateLimited,

  // Type guards
  isDataSuccess,
  isDataFailed,
  isDataLoading,
  isErrorState,
  isRetryableState,
};
