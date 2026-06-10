import type { Ref } from 'vue';
import { ref } from 'vue';
import {
  DataFailed,
  DataInitial,
  DataLoading,
  type DataState,
  DataSuccess,
} from '../../Core/NetworkStructure/Resources/dataState/dataState';

abstract class ControllerInterface<T> {
  public state: Ref<DataState<T>>;
  private paginationLoading: Ref<boolean> = ref(false);

  protected constructor(initialState: T | null = null) {
    this.state = ref(new DataInitial<T>(initialState)) as Ref<DataState<T>>;
  }

  // Start pagination loading indicator
  public startPaginationLoading() {
    this.paginationLoading.value = true;
  }

  // Stop pagination loading indicator
  public stopPaginationLoading() {
    this.paginationLoading.value = false;
  }

  // Get the current pagination loading state
  public getPaginationLoading(): boolean {
    return this.paginationLoading.value;
  }

  setLoading() {
    this.state.value = new DataLoading<T>();
  }

  setLoadingWithDialog() {
    this.state.value = new DataLoading<T>();
  }

  public setState(state: DataState<T>) {
    this.state.value = state;
  }

  isDataSuccess(): boolean {
    return this.state.value instanceof DataSuccess;
  }

  isDataLoading(): boolean {
    return this.state.value instanceof DataLoading;
  }
  isDataFailed(): boolean {
    return this.state.value instanceof DataFailed;
  }

  handleResponseDialogs() {
    if (this.state instanceof DataSuccess) {
      // TODO : Show Success Dialog
    } else {
      // TODO : Show Failed Optional
    }
  }

  public getState(): DataState<T> {
    return this.state.value;
  }
}

export { ControllerInterface };
