import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PrivacyController from './privacy.controller';

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({ clearFormData: vi.fn() }),
}));

vi.mock('@/router', () => ({
  default: { push: vi.fn() },
  push: vi.fn(),
}));

describe('PrivacyController', () => {
  let controller: PrivacyController;
  let mockRepository: any;

  beforeEach(() => {
    controller = PrivacyController.getInstance();

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
    const a = PrivacyController.getInstance();
    const b = PrivacyController.getInstance();
    expect(a).toBe(b);
  });
});
