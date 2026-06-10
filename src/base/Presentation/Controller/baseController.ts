import type { Ref, ComputedRef } from 'vue';
import { ref, computed } from 'vue';
import {
  DataFailed,
  DataInitial,
  DataLoading,
  type DataState,
  DataSuccess,
  isDataSuccess,
  isDataFailed,
  isDataLoading,
  isRetryableState,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type Params from '@/base/Core/Params/params';
import type BaseRepository from '@/base/Domain/Repositories/baseRepository';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
import { env } from '@/base/Core/Config';
import type PaginationModel from '@/base/Core/Models/paginationModel';
import TitleInterface from '@/base/Data/Models/titleInterface';

/**
 * Controller configuration options
 */
export interface ControllerConfig {
  /** Show loading dialog for operations */
  showLoadingDialog?: boolean;

  /** Show success dialog after create/update/delete */
  showSuccessDialog?: boolean;

  /** Show error dialog on failures */
  showErrorDialog?: boolean;

  /** Auto-retry on retryable errors */
  autoRetry?: boolean;

  /** Maximum auto-retry attempts */
  maxAutoRetries?: number;

  /** toast success */
  showSuccessTosat?: boolean;

  /** toast delete */
  showErrorTosat?: boolean;
}

/**
 * Default controller configuration
 */
const DEFAULT_CONFIG: ControllerConfig = {
  showLoadingDialog: false,
  showSuccessDialog: false,
  showSuccessTosat: false,
  showErrorDialog: false,
  showErrorTosat: false,
  autoRetry: false,
  maxAutoRetries: 2,
};

/**
 * Last operation info for retry
 */
interface LastOperation {
  type: 'fetchList' | 'fetchOne' | 'create' | 'update' | 'delete' | 'custom';
  params?: any;
  options?: ApiCallOptions;
}

/**
 * Base Controller providing unified CRUD state management with Vue reactivity.
 * Extend this class to create feature-specific controllers.
 *
 * @example
 * ```typescript
 * class ProductController extends BaseController<ProductModel, ProductModel[]> {
 *   private static instance: ProductController;
 *
 *   protected get repository() { return ProductRepository.getInstance(); }
 *
 *   private constructor() { super(); }
 *
 *   static getInstance() {
 *     if (!this.instance) this.instance = new ProductController();
 *     return this.instance;
 *   }
 *
 *   // Add custom actions for non-CRUD operations
 *   async fetchStats(productId: string) {
 *     this.setLoading();
 *     const result = await this.repository.getStats(productId);
 *     this.setState(result);
 *     return result;
 *   }
 * }
 * ```
 */
export default abstract class BaseController<T, TList = T[]> {
  // =========================================================================
  // State
  // =========================================================================

  /**
   * Reactive state for list operations.
   */
  public listState: Ref<DataState<TList>>;

  /**
   * Reactive state for single item operations.
   */
  public itemState: Ref<DataState<T>>;

  /**
   * Progress state for uploads/downloads (0-100).
   */
  public progressState: Ref<number> = ref(0);

  /**
   * Pagination loading indicator (for infinite scroll, etc.).
   */
  private _paginationLoading: Ref<boolean> = ref(false);

  /**
   * Last operation for retry support.
   */
  private _lastOperation: LastOperation | null = null;

  /**
   * Auto-retry counter.
   */
  private _autoRetryCount: number = 0;

  /**
   * The repository instance for data operations.
   */
  protected abstract get repository(): BaseRepository<T, TList>;

  /**
   * Controller configuration.
   */
  protected get config(): ControllerConfig {
    return DEFAULT_CONFIG;
  }

  /**
   * Merges controller config into API call options.
   * Caller-supplied options always take priority over config defaults.
   */
  private mergeOptions(options?: ApiCallOptions): ApiCallOptions {
    return {
      showErrorDialog: this.config.showErrorDialog ?? false,
      showLoadingDialog: this.config.showLoadingDialog ?? false,
      ...options,
    };
  }

  // =========================================================================
  // Constructor
  // =========================================================================

  protected constructor(initialList: TList | null = null, initialItem: T | null = null) {
    this.listState = ref(new DataInitial<TList>(initialList)) as Ref<DataState<TList>>;
    this.itemState = ref(new DataInitial<T>(initialItem)) as Ref<DataState<T>>;
  }

  // =========================================================================
  // Computed Properties
  // =========================================================================

  /**
   * Computed: List data (or null if not success)
   */
  get listData(): ComputedRef<TList | null> {
    return computed(() => {
      if (this.listState.value instanceof DataSuccess) {
        return this.listState.value.data;
      }
      return null;
    });
  }

  /**
   * Computed: Item data (or null if not success)
   */
  get itemData(): ComputedRef<T | null> {
    return computed(() => {
      if (this.itemState.value instanceof DataSuccess) {
        return this.itemState.value.data;
      }
      return null;
    });
  }

  /**
   * Computed: Pagination from list state
   */
  get pagination(): ComputedRef<PaginationModel | null> {
    return computed(() => {
      return this.listState.value.pagination;
    });
  }

  /**
   * Computed: Error message from list or item state
   */
  get errorMessage(): ComputedRef<string | null> {
    return computed(() => {
      const state = this.itemState.value.hasError ? this.itemState.value : this.listState.value;
      return state.error?.displayMessage || state.error?.title || null;
    });
  }

  /**
   * Computed: Can retry (has retryable error)
   */
  get canRetry(): ComputedRef<boolean> {
    return computed(() => {
      return isRetryableState(this.listState.value) || isRetryableState(this.itemState.value);
    });
  }

  // =========================================================================
  // LIST OPERATIONS (index)
  // =========================================================================

  /**
   * Fetch list of items.
   */
  async fetchList(params?: Params, options?: ApiCallOptions): Promise<DataState<TList>> {
    this._lastOperation = { type: 'fetchList', params, options };
    this._autoRetryCount = 0;

    this.setListLoading();

    if (this.config.showLoadingDialog) {
      this.showLoadingDialog('Loading...');
    }

    try {
      const result = await this.repository.index(
        params,
        this.mergeOptions(options),
        this.config.autoRetry,
      );
      this.setListState(result);
      this.handleListResponse(result);

      return result;
    } catch (error: any) {
      const failed = new DataFailed<TList>({ error });
      this.setListState(failed);
      this.handleErrorResponse(failed);

      return failed;
    } finally {
      this.hideLoadingDialog();
    }
  }

  /**
   * Append items to existing list (for pagination).
   */
  async appendToList(params?: Params, options?: ApiCallOptions): Promise<DataState<TList>> {
    this.startPaginationLoading();

    try {
      const result = await this.repository.index(params, this.mergeOptions(options));

      if (result instanceof DataSuccess && this.listState.value instanceof DataSuccess) {
        const currentData = this.listState.value.data;
        const newData = result.data;

        if (Array.isArray(currentData) && Array.isArray(newData)) {
          const mergedData = [...currentData, ...newData] as unknown as TList;
          this.setListState(
            new DataSuccess<TList>({
              data: mergedData,
              pagination: result.pagination,
              message: result.message,
            }),
          );
        } else {
          this.setListState(result);
        }
      } else {
        this.setListState(result);
      }

      return this.listState.value;
    } finally {
      this.stopPaginationLoading();
    }
  }

  /**
   * Refresh list (re-fetch with same params)
   */
  async refreshList(): Promise<DataState<TList>> {
    if (this._lastOperation?.type === 'fetchList') {
      return this.fetchList(this._lastOperation.params, this._lastOperation.options);
    }
    return this.fetchList();
  }

  // =========================================================================
  // SINGLE ITEM OPERATIONS (show, create, update, delete)
  // =========================================================================

  /**
   * Fetch single item by ID.
   */
  async fetchOne(params: Params, options?: ApiCallOptions): Promise<DataState<T>> {
    this._lastOperation = { type: 'fetchOne', params, options };

    this.setItemLoading();

    if (this.config.showLoadingDialog) {
      this.showLoadingDialog('Loading...');
    }

    try {
      const result = await this.repository.show(
        params,
        this.mergeOptions(options),
        this.config.autoRetry,
      );
      this.setItemState(result);
      this.handleItemResponse(result);
      return result;
    } catch (error: any) {
      const failed = new DataFailed<T>({ error });
      this.setItemState(failed);
      this.handleErrorResponse(failed);
      return failed;
    } finally {
      this.hideLoadingDialog();
    }
  }

  /**
   * Create new item.
   */
  async create(params: Params, options?: ApiCallOptions): Promise<DataState<T> | undefined> {
    this._lastOperation = { type: 'create', params, options };

    // console.log("[Controller] Creating item with params:", params);

    this.setItemLoading();

    if (this.config.showLoadingDialog) {
      this.showLoadingDialog('Creating...');
    }

    params.validate();
    if (!params.validate().isValid) {
      params.validateOrThrow();
      this.hideLoadingDialog();
      return;
    }
    try {
      const result = await this.repository.create(
        params,
        this.mergeOptions(options),
        this.config.autoRetry,
      );
      this.setItemState(result);

      this.handleItemResponse(result, 'Created successfully');
      return result;
    } catch (error: any) {
      const failed = new DataFailed<T>({ error });
      this.setItemState(failed);
      this.handleErrorResponse(failed);
      return failed;
    } finally {
      this.hideLoadingDialog();
    }
  }

  /**
   * Update existing item.
   */
  async update(params?: Params, options?: ApiCallOptions): Promise<DataState<T> | undefined> {
    this._lastOperation = { type: 'update', params, options };

    this.setItemLoading();

    if (this.config.showLoadingDialog) {
      this.showLoadingDialog('Updating...');
    }

    params?.validate();
    if (!params?.validate().isValid) {
      params?.validateOrThrow();
      return;
    }

    try {
      const result = await this.repository.update(
        params,
        this.mergeOptions(options),
        this.config.autoRetry,
      );
      this.setItemState(result);
      this.handleItemResponse(result, 'Updated successfully');
      return result;
    } catch (error: any) {
      const failed = new DataFailed<T>({ error });
      this.setItemState(failed);
      this.handleErrorResponse(failed);
      return failed;
    } finally {
      this.hideLoadingDialog();
    }
  }

  /**
   * Delete item by ID.
   */
  async delete(params?: Params, options?: ApiCallOptions): Promise<DataState<void> | undefined> {
    this._lastOperation = { type: 'delete', params, options };

    this.setItemLoading();

    if (this.config.showLoadingDialog) {
      this.showLoadingDialog('Deleting...');
    }

    params?.validate();
    if (!params?.validate().isValid) {
      params?.validateOrThrow();
      return;
    }
    try {
      const result = await this.repository.delete(params, this.mergeOptions(options));

      // Reset item state on successful delete
      if (result instanceof DataSuccess) {
        this.setItemState(new DataInitial<T>());
        if (this.config.showSuccessDialog) {
          this.showSuccessDialog('Deleted successfully');
          this.setItemState(result);
        }
      }

      return result;
    } catch (error: any) {
      this.handleErrorResponse(new DataFailed({ error }));
      return new DataFailed<void>({ error });
    } finally {
      this.hideLoadingDialog();
    }
  }

  // =========================================================================
  // RETRY SUPPORT
  // =========================================================================

  /**
   * Retry last failed operation.
   */
  async retryLastOperation(): Promise<DataState<any> | null> {
    if (!this._lastOperation) {
      if (env.isLoggingEnabled) {
        console.warn('[Controller] No operation to retry');
      }
      return null;
    }

    const op = this._lastOperation;

    switch (op.type) {
      case 'fetchList':
        return this.fetchList(op.params, op.options);
      case 'fetchOne':
        return this.fetchOne(op.params, op.options);
      case 'create':
        return (await this.create(op.params, op.options)) ?? null;
      case 'update':
        return (await this.update(op.params, op.options)) ?? null;
      case 'delete':
        return (await this.delete(op.params, op.options)) ?? null;
      default:
        return null;
    }
  }

  /**
   * Check if auto-retry should happen.
   */
  private shouldAutoRetry(state: DataState<any>): boolean {
    return (
      this.config.autoRetry === true &&
      isRetryableState(state) &&
      this._autoRetryCount < (this.config.maxAutoRetries || 2)
    );
  }

  async fetchAsOptions(
    params?: Params,
    options?: ApiCallOptions,
  ): Promise<TitleInterface<string | number>[]> {
    await this.fetchList(params, options);

    if (!this.isListSuccess()) return [];

    return ((this.listData.value as any[]) ?? []).map((el: any) => this.toTitleInterface(el));
  }

  protected toTitleInterface(el: any): TitleInterface<string | number> {
    return new TitleInterface({
      id: el?.id ?? el?.value ?? '',
      title: el?.title ?? el?.name ?? el?.label ?? String(el?.id ?? ''),
      subtitle: el?.subtitle ?? '',
    });
  }
  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================

  setListLoading(): void {
    this.listState.value = new DataLoading<TList>();
  }

  setItemLoading(): void {
    this.itemState.value = new DataLoading<T>();
  }

  setListState(state: DataState<TList>): void {
    this.listState.value = state;
  }

  setItemState(state: DataState<T>): void {
    this.itemState.value = state;
  }

  setProgress(value: number): void {
    this.progressState.value = Math.min(Math.max(value, 0), 100);
  }

  // =========================================================================
  // STATE CHECKS
  // =========================================================================

  isListLoading(): boolean {
    return isDataLoading(this.listState.value);
  }

  isListSuccess(): boolean {
    return isDataSuccess(this.listState.value);
  }

  isListFailed(): boolean {
    return isDataFailed(this.listState.value);
  }

  isItemLoading(): boolean {
    return isDataLoading(this.itemState.value);
  }

  isItemSuccess(): boolean {
    return isDataSuccess(this.itemState.value);
  }

  isItemFailed(): boolean {
    return isDataFailed(this.itemState.value);
  }

  // =========================================================================
  // PAGINATION
  // =========================================================================

  startPaginationLoading(): void {
    this._paginationLoading.value = true;
  }

  stopPaginationLoading(): void {
    this._paginationLoading.value = false;
  }

  get paginationLoading(): boolean {
    return this._paginationLoading.value;
  }

  get hasMorePages(): boolean {
    return this.listState.value.pagination?.hasMorePages ?? false;
  }

  // =========================================================================
  // DIALOG INTEGRATION
  // =========================================================================

  protected showLoadingDialog(message: string = 'Loading...'): void {
    dialogManager.loading(message);
  }

  protected hideLoadingDialog(): void {
    dialogManager.hideLoading();
  }

  protected showSuccessDialog(message: string): void {
    if (this.config.showSuccessDialog) {
      dialogManager.success(message);
    }
  }

  protected showSuccessToast(message: string): void {
    if (this.config.showSuccessTosat) {
      dialogManager.toastSuccess(message);
    }
  }

  protected showErrorDialog(message: string): void {
    if (this.config.showErrorDialog) {
      dialogManager.error(message);
    }
  }
  protected showErrorTosat(message: string): void {
    if (this.config.showErrorTosat) {
      dialogManager.toastError(message);
    }
  }

  protected showProgressDialog(progress: number, message?: string): void {
    dialogManager.progress(progress, message);
  }

  // =========================================================================
  // RESPONSE HANDLING (Override for custom behavior)
  // =========================================================================

  /**
   * Handle list response (override for custom dialogs/notifications).
   */
  protected handleListResponse(_result: DataState<TList>, _successMessage?: string): void {
    if (_result.hasError && !_result.error?.displayMessage.includes('success')) {
      this.handleErrorResponse(_result);
    }
    // else if (
    //   _result instanceof DataSuccess &&
    //   this.config.showSuccessDialog &&
    //   !this.config.showSuccessTosat &&
    //   Message
    // ) {
    //   this.showSuccessDialog(Message);
    // } else if (
    //   _result instanceof DataSuccess &&
    //   !this.config.showSuccessDialog &&
    //   this.config.showSuccessTosat &&
    //   Message
    // ) {
    //   this.showSuccessToast(Message);
    // }

    // Auto-retry if applicable
    if (this.shouldAutoRetry(_result)) {
      this._autoRetryCount++;
      setTimeout(() => this.retryLastOperation(), 1000);
    }
  }

  /**
   * Handle item response (override for custom dialogs/notifications).
   */
  protected handleItemResponse(_result: DataState<T>, successMessage?: string): void {
    if (_result.hasError) {
      this.handleErrorResponse(_result);
    } else if (
      _result instanceof DataSuccess &&
      this.config.showSuccessDialog &&
      !this.config.showSuccessTosat &&
      successMessage
    ) {
      this.showSuccessDialog(successMessage);
    } else if (
      _result instanceof DataSuccess &&
      !this.config.showSuccessDialog &&
      this.config.showSuccessTosat &&
      successMessage
    ) {
      this.showSuccessToast(successMessage);
    }

    // Auto-retry if applicable
    if (this.shouldAutoRetry(_result)) {
      this._autoRetryCount++;
      setTimeout(() => this.retryLastOperation(), 1000);
    }
  }

  /**
   * Handle error response.
   */
  protected handleErrorResponse(_result: DataState<any>): void {
    if (this.config.showErrorDialog && !this.config.showErrorTosat && _result.error) {
      this.showErrorDialog(_result.error.displayMessage);
    } else if (!this.config.showErrorDialog && this.config.showErrorTosat && _result.error) {
      this.showErrorTosat(_result.error.displayMessage);
    }
  }

  // =========================================================================
  // RESET
  // =========================================================================

  /**
   * Reset all states to initial.
   */
  reset(): void {
    this.listState.value = new DataInitial<TList>();
    this.itemState.value = new DataInitial<T>();
    this.progressState.value = 0;
    this._paginationLoading.value = false;
    this._lastOperation = null;
    this._autoRetryCount = 0;
  }

  /**
   * Reset list state to initial.
   */
  resetList(): void {
    this.listState.value = new DataInitial<TList>();
  }

  /**
   * Reset item state to initial.
   */
  resetItem(): void {
    this.itemState.value = new DataInitial<T>();
  }
}
