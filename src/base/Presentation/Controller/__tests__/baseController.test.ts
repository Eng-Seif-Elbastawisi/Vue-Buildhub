import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DataEmpty,
  DataFailed,
  type DataState,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import type BaseRepository from '@/base/Domain/Repositories/baseRepository';
import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';

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
