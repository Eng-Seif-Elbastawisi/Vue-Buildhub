import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TermsConditionsController from '../terms-conditions.controller';

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({ clearFormData: vi.fn() }),
}));

vi.mock('@/router', () => ({
  default: { push: vi.fn() },
  push: vi.fn(),
}));

describe('TermsConditionsController', () => {
  let controller: TermsConditionsController;
  let mockRepository: any;

  beforeEach(() => {
    controller = TermsConditionsController.getInstance();

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
    const a = TermsConditionsController.getInstance();
    const b = TermsConditionsController.getInstance();
    expect(a).toBe(b);
  });
});
