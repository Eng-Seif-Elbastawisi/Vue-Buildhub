import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DeletedReasonsController from './deleted.reasons.controller';

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({ clearFormData: vi.fn() }),
}));

vi.mock('@/router', () => ({
  default: { push: vi.fn() },
  push: vi.fn(),
}));

describe('DeletedReasonsController', () => {
  let controller: DeletedReasonsController;
  let mockRepository: any;

  beforeEach(() => {
    controller = DeletedReasonsController.getInstance();

    mockRepository = {
      index: vi.fn(),
      show: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    vi.spyOn(controller as any, 'repository', 'get').mockReturnValue(mockRepository);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the same singleton instance', () => {
    const a = DeletedReasonsController.getInstance();
    const b = DeletedReasonsController.getInstance();
    expect(a).toBe(b);
  });
});
