import { describe, it, expect, vi, beforeEach } from 'vitest';
import FaqsController from './faqs.controller';

// Mock dependencies
vi.mock('@/router', () => ({
  default: {
    push: vi.fn(),
  },
}));

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({
    clearFormData: vi.fn(),
  }),
}));

describe('FaqsController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the same singleton instance', () => {
    const a = FaqsController.getInstance();
    const b = FaqsController.getInstance();
    expect(a).toBe(b);
  });

  it('has correct configuration', () => {
    const controller = FaqsController.getInstance();
    // @ts-expect-error - config is protected
    const config = controller.config;
    expect(config.showLoadingDialog).toBe(true);
    expect(config.showSuccessDialog).toBe(true);
  });
});
