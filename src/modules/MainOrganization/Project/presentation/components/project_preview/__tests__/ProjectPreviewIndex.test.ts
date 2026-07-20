import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ProjectPreviewModel from '@/modules/MainOrganization/Project/core/models/project.preview.model';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import ProjectPreviewIndex from '../ProjectPreviewIndex.vue';

const controllerMocks = vi.hoisted(() => ({
  listState: { value: {} as unknown },
  fetchList: vi.fn(),
}));

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ query: {} })),
}));

vi.mock('../../../controllers/project.preview.controller', () => ({
  default: {
    getInstance: vi.fn(() => controllerMocks),
  },
}));

describe('ProjectPreviewIndex.vue', () => {
  afterEach(() => {
    vi.useRealTimers();
    controllerMocks.listState.value = {};
    controllerMocks.fetchList.mockClear();
  });

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

  it('shows an evaluation warning only before the scheduled preview time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-20T12:00:00'));

    const previews = [
      new ProjectPreviewModel({
        id: 1,
        preview_date: '2026-07-20',
        preview_time: '13:00:00',
      }),
      new ProjectPreviewModel({
        id: 2,
        preview_date: '2026-07-20',
        preview_time: '11:00:00',
      }),
      new ProjectPreviewModel({
        id: 3,
        preview_date: '2026-07-20',
        preview_time: '12:00:00',
      }),
      new ProjectPreviewModel({ id: 4 }),
    ];
    controllerMocks.listState.value = new DataSuccess({ data: previews });

    const wrapper = mount(ProjectPreviewIndex, {
      global: {
        mocks: {
          $t: (key: string, params?: { date?: string }) =>
            params?.date ? `${key}: ${params.date}` : key,
        },
        stubs: {
          TableSkelaton: true,
        },
      },
    });

    expect(wrapper.findAll('[role="status"]')).toHaveLength(1);
    expect(wrapper.text()).toContain('ProjectPreview.evaluation_warning_title');
    expect(wrapper.text()).toContain('ProjectPreview.evaluation_warning_description');
    expect(wrapper.text()).toContain('2026-07-20 13:00');
  });
});
