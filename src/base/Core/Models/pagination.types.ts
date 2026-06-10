/**
 * Pagination Types
 * Comprehensive type definitions for pagination handling
 */

/**
 * Pagination metadata from API response
 */
export interface PaginationMeta {
    /** Current page number (1-indexed) */
    currentPage: number;

    /** Number of items per page */
    perPage: number;

    /** Total number of items */
    total: number;

    /** Last page number */
    lastPage: number;

    /** Index of first item on current page */
    from: number;

    /** Index of last item on current page */
    to: number;
}

/**
 * Pagination links for navigation
 */
export interface PaginationLinks {
    /** URL for first page */
    first?: string;

    /** URL for last page */
    last?: string;

    /** URL for previous page */
    prev?: string;

    /** URL for next page */
    next?: string;
}

/**
 * Generic paginated response wrapper
 */
export interface PaginatedResponse<T> {
    /** Array of data items */
    data: T[];

    /** Pagination metadata */
    meta: PaginationMeta;

    /** Navigation links (optional) */
    links?: PaginationLinks;
}

/**
 * Parameters for pagination requests
 */
export interface PaginationParams {
    /** Page number to fetch (1-indexed) */
    page?: number;

    /** Number of items per page */
    perPage?: number;

    /** Field to sort by */
    sortBy?: string;

    /** Sort direction */
    sortOrder?: 'asc' | 'desc';

    /** Search query string */
    search?: string;

    /** Additional filters */
    filters?: Record<string, any>;
}

/**
 * Cursor-based pagination parameters
 */
export interface CursorPaginationParams {
    /** Cursor for next page */
    cursor?: string;

    /** Number of items to fetch */
    limit?: number;

    /** Direction of cursor */
    direction?: 'forward' | 'backward';
}

/**
 * Cursor-based pagination meta
 */
export interface CursorPaginationMeta {
    /** Cursor for next page */
    nextCursor?: string;

    /** Cursor for previous page */
    prevCursor?: string;

    /** Whether there are more items */
    hasMore: boolean;

    /** Number of items returned */
    count: number;
}

/**
 * Cursor-based paginated response
 */
export interface CursorPaginatedResponse<T> {
    /** Array of data items */
    data: T[];

    /** Cursor pagination metadata */
    meta: CursorPaginationMeta;
}

/**
 * Infinite scroll state
 */
export interface InfiniteScrollState {
    /** Whether currently loading more */
    isLoading: boolean;

    /** Whether all items have been loaded */
    hasMore: boolean;

    /** Current page (for offset pagination) */
    currentPage: number;

    /** Next cursor (for cursor pagination) */
    nextCursor?: string;

    /** Error if loading failed */
    error?: string;
}

/**
 * Pagination configuration options
 */
export interface PaginationConfig {
    /** Default items per page */
    defaultPerPage: number;

    /** Available per-page options */
    perPageOptions: number[];

    /** Maximum items per page */
    maxPerPage: number;

    /** Show page size selector */
    showPageSize: boolean;

    /** Show quick jump buttons */
    showQuickJump: boolean;

    /** Show total count */
    showTotal: boolean;
}

/**
 * Default pagination configuration
 */
export const DEFAULT_PAGINATION_CONFIG: PaginationConfig = {
    defaultPerPage: 10,
    perPageOptions: [10, 20, 50, 100],
    maxPerPage: 100,
    showPageSize: true,
    showQuickJump: true,
    showTotal: true,
};

/**
 * Query parameters for API request
 */
export interface PaginationQueryParams {
    page?: number;
    per_page?: number;
    limit?: number;
    offset?: number;
    sort?: string;
    order?: string;
    search?: string;
    [key: string]: any;
}

/**
 * Convert pagination params to query params
 */
export function toQueryParams(params: PaginationParams): PaginationQueryParams {
    const query: PaginationQueryParams = {};

    if (params.page !== undefined) {
        query.page = params.page;
    }

    if (params.perPage !== undefined) {
        query.per_page = params.perPage;
    }

    if (params.sortBy) {
        query.sort = params.sortBy;
        query.order = params.sortOrder || 'asc';
    }

    if (params.search) {
        query.search = params.search;
    }

    if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                query[key] = value;
            }
        });
    }

    return query;
}

/**
 * Convert offset/limit to page/perPage
 */
export function offsetToPage(offset: number, limit: number): { page: number; perPage: number } {
    return {
        page: Math.floor(offset / limit) + 1,
        perPage: limit,
    };
}

/**
 * Convert page/perPage to offset/limit
 */
export function pageToOffset(page: number, perPage: number): { offset: number; limit: number } {
    return {
        offset: (page - 1) * perPage,
        limit: perPage,
    };
}
