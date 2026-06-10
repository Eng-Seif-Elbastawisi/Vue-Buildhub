import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SubjectController from './subject.controller';

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({ clearFormData: vi.fn() }),
}));

vi.mock('@/router', () => ({
  default: { push: vi.fn() },
  push: vi.fn(),
}));

describe('SubjectController', () => {
  let controller: SubjectController;
  let mockRepository: any;

  beforeEach(() => {
    controller = SubjectController.getInstance();

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
    const a = SubjectController.getInstance();
    const b = SubjectController.getInstance();
    expect(a).toBe(b);
  });
});
