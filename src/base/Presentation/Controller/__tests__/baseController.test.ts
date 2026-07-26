import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DataEmpty,
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
import { DATA_MUTATION_SUCCEEDED_EVENT } from '@/base/Presentation/Controller/dataMutationEvent';

const dialogMocks = vi.hoisted(() => ({
  toastError: vi.fn(),
}));

vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: {
    error: vi.fn(),
    hideLoading: vi.fn(),
    loading: vi.fn(),
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

  beforeEach(() => {
    mutationListener.mockClear();
    window.addEventListener(DATA_MUTATION_SUCCEEDED_EVENT, mutationListener);
  });

  afterEach(() => {
    window.removeEventListener(DATA_MUTATION_SUCCEEDED_EVENT, mutationListener);
  });

  it('notifies subscribers after successful create, update, and delete operations', async () => {
    const controller = new TestMutationController(
      new DataSuccess({ data: { id: 1 }, message: 'Saved' }),
    );

    await controller.create(validParams);
    await controller.update(validParams);
    await controller.delete(validParams);

    expect(mutationListener).toHaveBeenCalledTimes(3);
  });

  it('does not notify subscribers when a mutation fails', async () => {
    const controller = new TestMutationController(
      new DataFailed({
        error: new ErrorModel('Unable to save', ErrorType.serviceSide),
      }),
    );

    await controller.create(validParams);

    expect(mutationListener).not.toHaveBeenCalled();
  });
});
