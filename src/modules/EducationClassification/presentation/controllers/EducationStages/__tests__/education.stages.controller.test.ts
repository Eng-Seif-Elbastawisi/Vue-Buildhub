import { describe, it, expect, vi, beforeEach } from 'vitest';
import EducationStageController from '../education.stages.controller';

// Mock the repository
vi.mock(
  '@/modules/EducationClassification/data/repositories/EducationStage/education.stages.repository',
  () => ({
    default: {
      getInstance: vi.fn(() => ({})),
    },
  }),
);

// Mock BaseController
const mockSuperCreate = vi.fn();
vi.mock('@/base/Presentation/Controller/baseController', () => ({
  default: class {
    async create(...args: any[]) {
      return mockSuperCreate(...args);
    }
  },
}));

describe('EducationStageController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (EducationStageController as any).instance = undefined;
  });

  it('should be a singleton', () => {
    const instance1 = EducationStageController.getInstance();
    const instance2 = EducationStageController.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should call super.create in create method', async () => {
    const controller = EducationStageController.getInstance();
    const params = { toMap: () => ({}) } as any;

    mockSuperCreate.mockResolvedValue({ isSuccess: true });

    const result = await controller.create(params);

    expect(mockSuperCreate).toHaveBeenCalledWith(params, { useJson: true });
    expect(result).toEqual({ isSuccess: true });
  });
});
