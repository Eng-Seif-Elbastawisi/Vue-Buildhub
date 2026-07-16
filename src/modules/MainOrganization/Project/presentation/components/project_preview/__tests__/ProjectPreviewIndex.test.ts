import { mount } from '@vue/test-utils';
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

  it('shows project-preview-specific copy when the list is empty', () => {
    const wrapper = mount(ProjectPreviewIndex, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          DataStatusBuilder: { template: '<div><slot name="empty" /></div>' },
          TableSkelaton: true,
        },
      },
    });

    expect(wrapper.text()).toContain('project_preview.empty_title');
    expect(wrapper.text()).toContain('project_preview.empty_description');
  });
});
