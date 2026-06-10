/**
 * Error Model
 * Represents error information with types and metadata
 */

/**
 * Error type enumeration for categorizing errors
 */
export const ErrorType = {
  /** Server-side error */
  serviceSide: 0,

  /** Network connectivity issue */
  networkConnection: 1,

  /** Empty data returned */
  dataEmpty: 2,

  /** Data parsing/corruption error */
  dataDirty: 3,

  /** Unknown error */
  unknown: 4,

  /** Bad request (400) */
  badRequest: 5,

  /** Unauthorized (401) */
  unAuthorized: 6,

  /** Method not allowed (405) */
  methodNotAllowed: 7,

  /** Request timeout */
  timeout: 8,

  /** Request cancelled */
  cancelled: 9,

  /** Rate limited (429) */
  rateLimit: 10,

  /** Validation error (422) */
  validation: 11,

  /** Forbidden (403) */
  forbidden: 12,

  /** Not found (404) */
  notFound: 13,

  /** Conflict (409) */
  conflict: 14,
} as const;

/**
 * Map ErrorType to user-friendly messages
 */
export const ERROR_TYPE_MESSAGES: Record<typeof ErrorType[keyof typeof ErrorType], string> = {
  [ErrorType.serviceSide]: 'Server error occurred',
  [ErrorType.networkConnection]: 'No internet connection',
  [ErrorType.dataEmpty]: 'No data available',
  [ErrorType.dataDirty]: 'Data could not be processed',
  [ErrorType.unknown]: 'An unexpected error occurred',
  [ErrorType.badRequest]: 'Invalid request',
  [ErrorType.unAuthorized]: 'Please log in again',
  [ErrorType.methodNotAllowed]: 'Operation not allowed',
  [ErrorType.timeout]: 'Request timed out',
  [ErrorType.cancelled]: 'Request was cancelled',
  [ErrorType.rateLimit]: 'Too many requests',
  [ErrorType.validation]: 'Please check your input',
  [ErrorType.forbidden]: 'Access denied',
  [ErrorType.notFound]: 'Not found',
  [ErrorType.conflict]: 'A conflict occurred',
};

/**
 * Check if error type is retryable
 */
export const RETRYABLE_ERROR_TYPES: (typeof ErrorType)[keyof typeof ErrorType][] = [
  ErrorType.serviceSide,
  ErrorType.networkConnection,
  ErrorType.timeout,
  ErrorType.rateLimit,
];

/**
 * Error Model class
 * Represents structured error information
 */
export class ErrorModel {
  /** Error title/message */
  public title: string;

  /** Error type classification */
  public type: (typeof ErrorType)[keyof typeof ErrorType];

  /** Optional detailed message */
  public details?: string;

  /** Optional error code */
  public code?: string;

  /** Optional validation errors */
  public validationErrors?: Record<string, string[]>;

  /** Retry function (for retryable errors) */
  public retryFn?: () => Promise<void>;

  constructor(
    title: string,
    type: (typeof ErrorType)[keyof typeof ErrorType],
    options?: {
      details?: string;
      code?: string;
      validationErrors?: Record<string, string[]>;
      retryFn?: () => Promise<void>;
    }
  ) {
    this.title = title;
    this.type = type;
    this.details = options?.details;
    this.code = options?.code;
    this.validationErrors = options?.validationErrors;
    this.retryFn = options?.retryFn;
  }

  /**
   * Check if this error is retryable
   */
  get isRetryable(): boolean {
    return RETRYABLE_ERROR_TYPES.includes(this.type);
  }

  /**
   * Get display message for this error
   */
  get displayMessage(): string {
    return this.title || ERROR_TYPE_MESSAGES[this.type];
  }

  /**
   * Create error model from exception
   */
  static fromException(error: Error, type: (typeof ErrorType)[keyof typeof ErrorType] = ErrorType.unknown): ErrorModel {
    return new ErrorModel(error.message, type);
  }

  /**
   * Create a network connection error
   */
  static networkError(retryFn?: () => Promise<void>): ErrorModel {
    return new ErrorModel(
      'No internet connection',
      ErrorType.networkConnection,
      { retryFn }
    );
  }

  /**
   * Create a timeout error
   */
  static timeoutError(retryFn?: () => Promise<void>): ErrorModel {
    return new ErrorModel(
      'Request timed out',
      ErrorType.timeout,
      { retryFn }
    );
  }

  /**
   * Create an empty data error
   */
  static emptyError(message?: string): ErrorModel {
    return new ErrorModel(
      message || 'No data available',
      ErrorType.dataEmpty
    );
  }

  /**
   * Create a validation error
   */
  static validationError(
    errors: Record<string, string[]>,
    message?: string
  ): ErrorModel {
    return new ErrorModel(
      message || 'Please check your input',
      ErrorType.validation,
      { validationErrors: errors }
    );
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      title: this.title,
      type: this.type,
      typeName: Object.keys(ErrorType).find(key => ErrorType[key as keyof typeof ErrorType] === this.type),
      details: this.details,
      code: this.code,
      validationErrors: this.validationErrors,
      isRetryable: this.isRetryable,
    };
  }
}
