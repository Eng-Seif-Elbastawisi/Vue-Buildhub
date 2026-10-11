import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DataEmpty,
  DataCancelled,
  DataLoading,
  DataFailed,
  DataSuccess,
  type DataState,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import type Params from '@/base/Core/Params/params';
import type BaseRepository from '@/base/Domain/Repositories/baseRepository';
import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';
import {
  beginDeleteConfirmation,
  DATA_MUTATION_SUCCEEDED_EVENT,
  DELETE_OUTCOME_EVENT,
  type DeleteOutcome,
} from '@/base/Presentation/Controller/dataMutationEvent';

const dialogMocks = vi.hoisted(() => ({
  toastError: vi.fn(),
  deleteError: vi.fn(),
  deleteSuccess: vi.fn(),
  loading: vi.fn(),
}));

vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: {
    error: vi.fn(),
    deleteError: dialogMocks.deleteError,
    deleteSuccess: dialogMocks.deleteSuccess,
    hideLoading: vi.fn(),
    loading: dialogMocks.loading,
    progress: vi.fn(),
    success: vi.fn(),
    toastError: dialogMocks.toastError,
    toastSuccess: vi.fn(),
  },
}));

class TestController extends BaseController<unknown, unknown[]> {
  constructor(private readonly listResponse: DataState<unknown[]>) {
    super();
  }

  protected get repository(): BaseRepository<unknown, unknown[]> {
    return {
      index: vi.fn().mockResolvedValue(this.listResponse),
    } as unknown as BaseRepository<unknown, unknown[]>;
  }

  protected get config(): ControllerConfig {
    return {
      showErrorDialog: false,
      showErrorTosat: true,
    };
  }
}

class TestMutationController extends BaseController<unknown> {
  constructor(private readonly mutationResponse: DataState<unknown>) {
    super();
  }

  protected get repository(): BaseRepository<unknown> {
    return {
      create: vi.fn().mockResolvedValue(this.mutationResponse),
      update: vi.fn().mockResolvedValue(this.mutationResponse),
      delete: vi.fn().mockResolvedValue(this.mutationResponse),
    } as unknown as BaseRepository<unknown>;
  }
}

class TestLoadingMutationController extends TestMutationController {
  protected get config(): ControllerConfig {
    return { showLoadingDialog: true, showSuccessDialog: true };
  }
}

class ScopedMutationController extends TestMutationController {
  scopeCurrent = true;
  protected captureMutationScope() {
    return () => this.scopeCurrent;
  }
}

const validParams: Params = {
  toMap: () => ({}),
  validate: () => ({ isValid: true, errors: [] }),
  validateOrThrow: vi.fn(),
};

describe('BaseController list feedback', () => {
  beforeEach(() => {
    dialogMocks.toastError.mockClear();
  });

  it('does not present an empty search result as an error', async () => {
    const controller = new TestController(
      new DataEmpty(new ErrorModel('Departments fetched successfully', ErrorType.dataEmpty)),
    );

    await controller.fetchList();

    expect(controller.errorMessage.value).toBeNull();
    expect(dialogMocks.toastError).not.toHaveBeenCalled();
  });

  it('continues to present real list errors', async () => {
    const controller = new TestController(
      new DataFailed<unknown[]>({
        error: new ErrorModel('Unable to fetch departments', ErrorType.serviceSide),
      }),
    );

    await controller.fetchList();

    expect(controller.errorMessage.value).toBe('Unable to fetch departments');
    expect(dialogMocks.toastError).toHaveBeenCalledWith('Unable to fetch departments');
  });
});

describe('BaseController mutation notifications', () => {
  const mutationListener = vi.fn();
  const deleteOutcomes: DeleteOutcome[] = [];
  const deleteListener = (event: Event) => {
    deleteOutcomes.push((event as CustomEvent<DeleteOutcome>).detail);
  };

  beforeEach(() => {
    mutationListener.mockClear();
    dialogMocks.deleteError.mockClear();
    dialogMocks.deleteSuccess.mockClear();
    dialogMocks.loading.mockClear();
    deleteOutcomes.length = 0;
    window.addEventListener(DATA_MUTATION_SUCCEEDED_EVENT, mutationListener);
    window.addEventListener(DELETE_OUTCOME_EVENT, deleteListener);
  });

  afterEach(() => {
    window.removeEventListener(DATA_MUTATION_SUCCEEDED_EVENT, mutationListener);
    window.removeEventListener(DELETE_OUTCOME_EVENT, deleteListener);
  });

  it('notifies subscribers after successful create, update, and delete operations', async () => {
    const controller = new TestMutationController(
      new DataSuccess({ data: { id: 1 }, message: 'Saved' }),
    );

    await controller.create(validParams);
    await controller.update(validParams);
    await controller.delete(validParams);

    expect(mutationListener).toHaveBeenCalledTimes(3);
    expect(deleteOutcomes).toEqual([{ status: 'success' }]);
  });

  it.each(['create', 'update', 'delete'] as const)(
    'discards a stale %s before assigning state or notifying subscribers',
    async (operation) => {
      const controller = new ScopedMutationController(new DataSuccess({ data: { id: 1 } }));
      const request = controller[operation](validParams);
      controller.scopeCurrent = false;
      expect(await request).toBeInstanceOf(DataCancelled);
      expect(controller.itemState.value).toBeInstanceOf(DataLoading);
      expect(mutationListener).not.toHaveBeenCalled();
      expect(deleteOutcomes).toEqual([]);
    },
  );

  it('does not notify subscribers when a mutation fails', async () => {
    const controller = new TestMutationController(
      new DataFailed({
        error: new ErrorModel('Unable to save', ErrorType.serviceSide),
      }),
    );

    await controller.create(validParams);

    expect(mutationListener).not.toHaveBeenCalled();
  });

  it('shows the stuck-block dialog with the original related-record delete message', async () => {
    dialogMocks.deleteError.mockClear();
    const backendMessage = 'هذا العنصر مرتبط ببيانات أخرى ولا يمكن حذفه حالياً';
    const controller = new TestMutationController(
      new DataFailed({ error: new ErrorModel(backendMessage, ErrorType.conflict) }),
    );

    await controller.delete(validParams);

    expect(dialogMocks.deleteError).toHaveBeenCalledWith(backendMessage);
    expect(mutationListener).not.toHaveBeenCalled();
    expect(deleteOutcomes).toEqual([{ status: 'error', errorMessage: backendMessage }]);
  });

  it('lets an active delete confirmation present the backend error without a second dialog', async () => {
    dialogMocks.deleteError.mockClear();
    const backendMessage = 'This item is linked to another record';
    const controller = new TestMutationController(
      new DataFailed({ error: new ErrorModel(backendMessage, ErrorType.conflict) }),
    );
    const handleLocally = (event: Event) => event.preventDefault();
    window.addEventListener(DELETE_OUTCOME_EVENT, handleLocally);

    try {
      await controller.delete(validParams);
    } finally {
      window.removeEventListener(DELETE_OUTCOME_EVENT, handleLocally);
    }

    expect(dialogMocks.deleteError).not.toHaveBeenCalled();
    expect(deleteOutcomes).toEqual([{ status: 'error', errorMessage: backendMessage }]);
  });

  it('leaves the shared dialog visible through success motion before list refresh', async () => {
    const release = beginDeleteConfirmation();
    const handleLocally = (event: Event) => event.preventDefault();
    window.addEventListener(DELETE_OUTCOME_EVENT, handleLocally);
    const controller = new TestLoadingMutationController(new DataSuccess({ data: null }));

    try {
      const deletion = controller.delete(validParams);
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(dialogMocks.loading).not.toHaveBeenCalled();
      expect(dialogMocks.deleteSuccess).not.toHaveBeenCalled();
      expect(mutationListener).not.toHaveBeenCalled();
      await deletion;
      expect(dialogMocks.deleteSuccess).toHaveBeenCalledOnce();
      expect(mutationListener).toHaveBeenCalledOnce();
    } finally {
      window.removeEventListener(DELETE_OUTCOME_EVENT, handleLocally);
      release();
    }
  });
});
