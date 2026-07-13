import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import ProjectHistory from '../ProjectHistory.vue';

const fetchProjectStatusHistories = vi.hoisted(() => vi.fn());

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { project_id: '27' } }),
  RouterLink: {
    props: ['to'],
    template: '<a><slot /></a>',
  },
}));

vi.mock('vue-i18n', () => ({
  createI18n: () => ({
    global: {
      t: (key: string) => key,
    },
  }),
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'ProjectHistory.back_to_project': 'Back to project',
        'ProjectHistory.eyebrow': 'Project activity',
        'ProjectHistory.title': 'Project History',
        'ProjectHistory.timeline_title': 'Status timeline',
        'ProjectHistory.status.revised': 'Revised version',
        'ProjectShow.project_code': 'Project Code',
        'ProjectShow.client': 'Client',
        'ProjectShow.project_date': 'Project Date',
        'ProjectShow.created_at': 'Created at',
        loading: 'Loading...',
        no_data: 'No data',
        unknown: 'Unknown',
      };

      return translations[key] ?? key;
    },
  }),
}));

vi.mock('../../controllers/project.controller', async () => {
  const { computed, ref } = await import('vue');
  const { DataSuccess } =
    await import('@/base/Core/NetworkStructure/Resources/dataState/dataState');
  const ProjectHistoryModel = (await import('../../../core/models/project.history.model')).default;
  const historyState = ref(
    new DataSuccess({
      data: ProjectHistoryModel.fromJson({
        project: {
          id: 27,
          client: { id: 5, title: 'you' },
          title: 'Project title',
          description: 'Project description',
          date: '2026-07-12',
          created_at: '2026-07-12 08:37:09',
        },
        histories: [{ id: 14, status: 4, created_at: '2026-07-12 09:49:51' }],
      }),
    }),
  );

  return {
    default: {
      getInstance: () => ({
        historyState,
        historyData: computed(() => historyState.value.data),
        fetchProjectStatusHistories,
      }),
    },
  };
});

describe('ProjectHistory', () => {
  it('fetches and renders project status history', async () => {
    const wrapper = mount(ProjectHistory, {
      global: {
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a><slot /></a>',
          },
        },
      },
    });

    await nextTick();

    expect(fetchProjectStatusHistories).toHaveBeenCalledTimes(1);
    expect(fetchProjectStatusHistories.mock.calls[0][0].toMap()).toEqual({ project_id: 27 });
    expect(wrapper.text()).toContain('Project History');
    expect(wrapper.text()).toContain('Project title');
    expect(wrapper.text()).toContain('you');
    expect(wrapper.text()).toContain('Revised version');
    expect(wrapper.text()).toContain('12 Jul 2026');
    expect(wrapper.text()).toContain('09:49 AM');
  });
});
