/**
 * Pagination Model
 * Enhanced pagination model with helper methods and type safety
 */

import type { PaginationMeta, PaginationLinks, PaginationQueryParams, PaginationParams } from './pagination.types';
import { toQueryParams, pageToOffset } from './pagination.types';

/**
 * PaginationModel - Represents pagination state and provides navigation helpers
 */
class PaginationModel implements PaginationMeta {
  /** Index of first item on current page */
  public from: number;

  /** Number of items per page */
  public perPage: number;

  /** Index of last item on current page */
  public to: number;

  /** Current page number (1-indexed) */
  public currentPage: number;

  /** Last page number */
  public lastPage: number;

  /** Total number of items */
  public total: number;

  /** Navigation links (optional) */
  public links?: PaginationLinks;

  constructor(
    from: number = 0,
    perPage: number = 10,
    to: number = 0,
    currentPage: number = 1,
    lastPage: number = 1,
    total: number = 0,
    links?: PaginationLinks
  ) {
    this.from = from;
    this.perPage = perPage;
    this.to = to;
    this.currentPage = currentPage;
    this.lastPage = lastPage;
    this.total = total;
    this.links = links;
  }

  // =========================================================================
  // Factory Methods
  // =========================================================================

  /**
   * Create from API response meta object
   */
  static fromMap(map: Record<string, any>): PaginationModel {
    return new PaginationModel(
      map['from'] ?? map['start'] ?? 0,
      map['per_page'] ?? map['perPage'] ?? map['limit'] ?? 10,
      map['to'] ?? map['end'] ?? 0,
      map['current_page'] ?? map['currentPage'] ?? map['page'] ?? 1,
      map['last_page'] ?? map['lastPage'] ?? map['totalPages'] ?? 1,
      map['total'] ?? map['totalItems'] ?? map['count'] ?? 0,
      map['links']
    );
  }

  /**
   * Create an empty/initial pagination model
   */
  static empty(perPage: number = 10): PaginationModel {
    return new PaginationModel(0, perPage, 0, 1, 1, 0);
  }

  /**
   * Create from total items count
   */
  static fromTotal(total: number, perPage: number = 10, currentPage: number = 1): PaginationModel {
    const lastPage = Math.ceil(total / perPage) || 1;
    const from = total > 0 ? (currentPage - 1) * perPage + 1 : 0;
    const to = Math.min(currentPage * perPage, total);

    return new PaginationModel(from, perPage, to, currentPage, lastPage, total);
  }

  // =========================================================================
  // Navigation Checks
  // =========================================================================

  /**
   * Check if there are more pages available
   */
  get hasMorePages(): boolean {
    return this.currentPage < this.lastPage;
  }

  /**
   * Check if there is a previous page
   */
  get hasPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  /**
   * Check if there is a next page
   */
  get hasNextPage(): boolean {
    return this.currentPage < this.lastPage;
  }

  /**
   * Check if this is the first page
   */
  get isFirstPage(): boolean {
    return this.currentPage === 1;
  }

  /**
   * Check if this is the last page
   */
  get isLastPage(): boolean {
    return this.currentPage >= this.lastPage;
  }

  /**
   * Check if there is data
   */
  get hasData(): boolean {
    return this.total > 0;
  }

  /**
   * Check if empty
   */
  get isEmpty(): boolean {
    return this.total === 0;
  }

  // =========================================================================
  // Page Calculations
  // =========================================================================

  /**
   * Get previous page number
   */
  get previousPage(): number {
    return Math.max(1, this.currentPage - 1);
  }

  /**
   * Get next page number
   */
  get nextPage(): number {
    return Math.min(this.lastPage, this.currentPage + 1);
  }

  /**
   * Get offset for current page (0-indexed)
   */
  get offset(): number {
    return (this.currentPage - 1) * this.perPage;
  }

  /**
   * Get number of items on current page
   */
  get itemsOnPage(): number {
    if (this.total === 0) return 0;
    return this.to - this.from + 1;
  }

  /**
   * Get remaining items after current page
   */
  get remainingItems(): number {
    return Math.max(0, this.total - this.to);
  }

  /**
   * Get progress percentage (0-100)
   */
  get progressPercentage(): number {
    if (this.total === 0) return 0;
    return Math.round((this.to / this.total) * 100);
  }

  // =========================================================================
  // Display Helpers
  // =========================================================================

  /**
   * Get display string for current range
   * Example: "1-10 of 100"
   */
  get rangeDisplay(): string {
    if (this.total === 0) return 'No items';
    return `${this.from}-${this.to} of ${this.total}`;
  }

  /**
   * Get display string for page info
   * Example: "Page 1 of 10"
   */
  get pageDisplay(): string {
    return `Page ${this.currentPage} of ${this.lastPage}`;
  }

  /**
   * Get array of page numbers for pagination UI
   * @param maxVisible Maximum number of page buttons to show
   */
  getPageNumbers(maxVisible: number = 7): number[] {
    const pages: number[] = [];

    if (this.lastPage <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= this.lastPage; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis
      const halfVisible = Math.floor(maxVisible / 2);
      let start = Math.max(1, this.currentPage - halfVisible);
      let end = Math.min(this.lastPage, this.currentPage + halfVisible);

      // Adjust if near start
      if (this.currentPage <= halfVisible) {
        end = maxVisible;
      }

      // Adjust if near end
      if (this.currentPage > this.lastPage - halfVisible) {
        start = this.lastPage - maxVisible + 1;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  // =========================================================================
  // Query Building
  // =========================================================================

  /**
   * Get query params for API request
   */
  toQueryParams(additionalParams?: Partial<PaginationParams>): PaginationQueryParams {
    return toQueryParams({
      page: this.currentPage,
      perPage: this.perPage,
      ...additionalParams,
    });
  }

  /**
   * Get offset/limit params
   */
  toOffsetParams(): { offset: number; limit: number } {
    return pageToOffset(this.currentPage, this.perPage);
  }

  // =========================================================================
  // Navigation Methods (return new instances)
  // =========================================================================

  /**
   * Get pagination for next page
   */
  goToNextPage(): PaginationModel {
    if (!this.hasNextPage) return this;
    return PaginationModel.fromTotal(this.total, this.perPage, this.nextPage);
  }

  /**
   * Get pagination for previous page
   */
  goToPreviousPage(): PaginationModel {
    if (!this.hasPreviousPage) return this;
    return PaginationModel.fromTotal(this.total, this.perPage, this.previousPage);
  }

  /**
   * Get pagination for specific page
   */
  goToPage(page: number): PaginationModel {
    const validPage = Math.max(1, Math.min(page, this.lastPage));
    return PaginationModel.fromTotal(this.total, this.perPage, validPage);
  }

  /**
   * Get pagination with different per page
   */
  withPerPage(perPage: number): PaginationModel {
    // Calculate new current page to stay in similar position
    const currentOffset = this.offset;
    const newPage = Math.floor(currentOffset / perPage) + 1;
    return PaginationModel.fromTotal(this.total, perPage, newPage);
  }

  // =========================================================================
  // Conversion
  // =========================================================================

  /**
   * Convert to plain object
   */
  toJSON(): PaginationMeta & { links?: PaginationLinks } {
    return {
      currentPage: this.currentPage,
      perPage: this.perPage,
      total: this.total,
      lastPage: this.lastPage,
      from: this.from,
      to: this.to,
      links: this.links,
    };
  }

  /**
   * Create a clone
   */
  clone(): PaginationModel {
    return new PaginationModel(
      this.from,
      this.perPage,
      this.to,
      this.currentPage,
      this.lastPage,
      this.total,
      this.links ? { ...this.links } : undefined
    );
  }

  // =========================================================================
  // Legacy Compatibility
  // =========================================================================

  /** @deprecated Use previousPage */
  get prev(): number | null {
    return this.hasPreviousPage ? this.previousPage : null;
  }

  /** @deprecated Use nextPage */
  get next(): number | null {
    return this.hasNextPage ? this.nextPage : null;
  }

  /** @deprecated Use currentPage */
  get current(): number | null {
    return this.currentPage;
  }

  /** @deprecated Use perPage */
  get count(): number | null {
    return this.perPage;
  }

  /** @deprecated Use lastPage */
  get last(): number | null {
    return this.lastPage;
  }

  /** @deprecated Use hasNextPage */
  checkAvailablePages(): boolean {
    return this.hasNextPage;
  }

  /** @deprecated Use hasNextPage */
  checkAvailableNext(): boolean {
    return this.hasNextPage;
  }

  /** @deprecated Use hasPreviousPage */
  checkAvailablePrev(): boolean {
    return this.hasPreviousPage;
  }
}

export default PaginationModel;
