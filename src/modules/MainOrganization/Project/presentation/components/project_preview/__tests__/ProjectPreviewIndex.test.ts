import { describe, expect, it, vi } from 'vitest';
import ProjectPreviewIndex from '../ProjectPreviewIndex.vue';

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ query: {} })),
}));

vi.mock('../../../controllers/project.preview.controller', () => ({
  default: {
    getInstance: vi.fn(() => ({
      listState: { value: {} },
      fetchList: vi.fn(),
    })),
  },
}));

describe('ProjectPreviewIndex.vue', () => {
  it('is defined', () => {
    expect(ProjectPreviewIndex).toBeDefined();
  });
});
