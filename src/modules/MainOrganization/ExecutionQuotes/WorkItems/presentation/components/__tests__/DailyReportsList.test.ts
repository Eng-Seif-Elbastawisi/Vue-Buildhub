import { expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import DailyReportsList from '../DailyReportsList.vue';
import DailyReportModel from '../../../core/models/report.model';
it('renders report safety and nullable notes in its own accordion', () => {
  const report = DailyReportModel.fromJson({
    id: 1,
    project_timeline_stage_id: 18,
    date: '2026-10-12',
    notes: null,
    site_safety_status: 3,
    employee: { id: 1, name: 'Creator', type: 1 },
    created_at: null,
  });
  const wrapper = mount(DailyReportsList, {
    props: { state: new DataSuccess({ data: [report] }), stageLabel: (id) => `Stage ${id}` },
    global: { mocks: { $t: (key: string) => key } },
  });
  expect(wrapper.get('h3').text()).toBe('2026-10-12');
  expect(wrapper.get('.work-items-safety-3').text()).toBe('work_items.safety_3');
  expect(wrapper.text()).toContain('work_items.no_notes');
  expect(wrapper.get('.work-items-section-count').text()).toBe('1');
  wrapper.unmount();
});
