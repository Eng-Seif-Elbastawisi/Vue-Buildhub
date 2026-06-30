import { describe, expect, it, vi } from 'vitest';
import ProjectFloorIndex from '../ProjectFloorIndex.vue';

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ query: {} })),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({ user: { isMaster: false } })),
}));

vi.mock('../../controllers/project.floor.controller', () => ({
  default: {
    getInstance: vi.fn(() => ({
      listState: { value: {} },
      pagination: { value: {} },
      fetchList: vi.fn(),
      delete: vi.fn(),
    })),
  },
}));

describe('ProjectFloorIndex.vue', () => {
  it('is defined', () => {
    expect(ProjectFloorIndex).toBeDefined();
  });
});
