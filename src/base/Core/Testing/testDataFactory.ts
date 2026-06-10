/**
 * Test Data Factory
 * Utilities for creating mock data and states for testing
 */

import {
  type DataState,
  DataSuccess,
  DataFailed,
  DataLoading,
  DataInitial,
  DataEmpty,
  DataTimeout,
  DataNoNetwork,
  DataProgress,
  DataCancelled,
  DataRateLimited,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import PaginationModel from '@/base/Core/Models/paginationModel';
import type { PaginatedResponse, PaginationMeta } from '@/base/Core/Models/pagination.types';

/**
 * TestDataFactory - Utilities for creating test data
 */
export class TestDataFactory {
  // =========================================================================
  // DataState Creation
  // =========================================================================

  /**
   * Create a success state with data
   */
  static success<T>(data: T, message?: string): DataSuccess<T> {
    return new DataSuccess<T>({
      data,
      message: message ?? 'Success',
    });
  }

  /**
   * Create a success state with pagination
   */
  static successPaginated<T>(
    data: T,
    page: number = 1,
    perPage: number = 10,
    total: number = 100,
  ): DataSuccess<T> {
    return new DataSuccess<T>({
      data,
      message: 'Success',
      pagination: PaginationModel.fromTotal(total, perPage, page),
    });
  }

  /**
   * Create a failed state
   */
  static failed<T = any>(
    message: string = 'An error occurred',
    type: (typeof ErrorType)[keyof typeof ErrorType] = ErrorType.unknown,
  ): DataFailed<T> {
    return new DataFailed<T>({
      error: new ErrorModel(message, type),
    });
  }

  /**
   * Create a loading state
   */
  static loading<T>(): DataLoading<T> {
    return new DataLoading<T>();
  }

  /**
   * Create an initial state
   */
  static initial<T>(initialData?: T | null): DataInitial<T> {
    return new DataInitial<T>(initialData ?? null);
  }

  /**
   * Create an empty state
   */
  static empty<T>(message?: string): DataEmpty<T> {
    return new DataEmpty<T>(new ErrorModel(message ?? 'No data available', ErrorType.dataEmpty));
  }

  /**
   * Create a timeout state
   */
  static timeout<T>(retryFn?: () => Promise<DataState<T>>): DataTimeout<T> {
    return new DataTimeout<T>(retryFn);
  }

  /**
   * Create a no network state
   */
  static noNetwork<T>(retryFn?: () => Promise<DataState<T>>): DataNoNetwork<T> {
    return new DataNoNetwork<T>(retryFn);
  }

  /**
   * Create a progress state
   */
  static progress<T>(progress: number, total?: number): DataProgress<T> {
    return new DataProgress<T>(progress, total);
  }

  /**
   * Create a cancelled state
   */
  static cancelled<T>(): DataCancelled<T> {
    return new DataCancelled<T>();
  }

  /**
   * Create a rate limited state
   */
  static rateLimited<T>(retryAfter?: number): DataRateLimited<T> {
    return new DataRateLimited<T>(retryAfter);
  }

  // =========================================================================
  // Pagination
  // =========================================================================

  /**
   * Create a paginated response
   */
  static pagination<T>(items: T[], page: number = 1, perPage: number = 10): PaginatedResponse<T> {
    const total = items.length;
    const lastPage = Math.ceil(total / perPage) || 1;
    const startIndex = (page - 1) * perPage;
    const endIndex = Math.min(startIndex + perPage, total);
    const pageItems = items.slice(startIndex, endIndex);

    return {
      data: pageItems,
      meta: {
        currentPage: page,
        perPage,
        total,
        lastPage,
        from: total > 0 ? startIndex + 1 : 0,
        to: endIndex,
      },
    };
  }

  /**
   * Create pagination meta
   */
  static paginationMeta(
    page: number = 1,
    perPage: number = 10,
    total: number = 100,
  ): PaginationMeta {
    const lastPage = Math.ceil(total / perPage) || 1;
    const from = total > 0 ? (page - 1) * perPage + 1 : 0;
    const to = Math.min(page * perPage, total);

    return {
      currentPage: page,
      perPage,
      total,
      lastPage,
      from,
      to,
    };
  }

  // =========================================================================
  // API Response Simulation
  // =========================================================================

  /**
   * Create a mock API response
   */
  static apiResponse<T>(
    data: T,
    status: boolean = true,
    message: string = 'Success',
  ): { data: { data: T; status: boolean; message: string }; statusCode: number } {
    return {
      data: {
        data,
        status,
        message,
      },
      statusCode: status ? 200 : 400,
    };
  }

  /**
   * Create a mock paginated API response
   */
  static paginatedApiResponse<T>(items: T[], page: number = 1, perPage: number = 10) {
    const paginated = this.pagination(items, page, perPage);

    return {
      data: {
        data: {
          data: paginated.data,
          meta: paginated.meta,
        },
        status: true,
        message: 'Success',
      },
      statusCode: 200,
    };
  }

  /**
   * Create a mock error API response
   */
  static errorApiResponse(message: string = 'Error', statusCode: number = 400) {
    return {
      data: {
        data: null,
        status: false,
        message,
      },
      statusCode,
    };
  }

  // =========================================================================
  // Utilities
  // =========================================================================

  /**
   * Delay execution (simulate network latency)
   */
  static delay(ms: number = 1000): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create a delayed response
   */
  static async delayedResponse<T>(data: T, delayMs: number = 500): Promise<T> {
    await this.delay(delayMs);
    return data;
  }

  /**
   * Create a random delay (simulate variable network conditions)
   */
  static randomDelay(minMs: number = 200, maxMs: number = 1000): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    return this.delay(delay);
  }

  /**
   * Generate unique ID
   */
  static uniqueId(prefix: string = 'id'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate random integer
   */
  static randomInt(min: number = 1, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate random string
   */
  static randomString(length: number = 10): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join('');
  }

  /**
   * Pick random item from array
   */
  static randomItem<T>(items: T[]): T | undefined {
    return items[Math.floor(Math.random() * items.length)];
  }

  /**
   * Generate array of items using factory function
   */
  static generateArray<T>(count: number, factory: (index: number) => T): T[] {
    return Array.from({ length: count }, (_, index) => factory(index));
  }
}

export default TestDataFactory;
