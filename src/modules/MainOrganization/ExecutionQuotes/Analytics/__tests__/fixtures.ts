import { response } from '../../SiteTeam/__tests__/network';
import { startedOverview } from '../../WorkItems/__tests__/timeline-fixtures';
import { requestRecord } from '../../Procurement/__tests__/fixtures';
export const employee = { id: 4, name: 'Engineer', type: 4 };
export const report = (id = 1, date = '2026-10-19', safety = 3) => ({
  id,
  project_timeline_stage_id: 18,
  employee,
  date,
  site_safety_status: safety,
  notes: null,
  created_at: '2026-01-01 10:00:00',
});
export const task = (assigned = false) => ({
  id: 5,
  project_timeline_stage_id: 18,
  employee,
  title: 'Inspect',
  assigned_employee: assigned ? employee : null,
  created_at: null,
  end_date: '2026-01-01',
});
export const activity = (type = 1, date: string | null = '2026-10-19') => ({
  id: type,
  project_timeline_stage_id: 18,
  employee,
  title: 'Record',
  type,
  date,
  created_at: null,
  assigned_employee: null,
});
export const drawing = (quoteId = 140, projectId = 86) => ({
  id: 6,
  quote_id: quoteId,
  project_id: projectId,
  title: 'MEP',
  version_number: 'V1',
  stages: [{ id: 18, stage: { id: 77, title: 'Electrical' }, sub_stage: null }],
});
export function overview() {
  const data = startedOverview();
  return {
    status: true,
    data: {
      basicData: { count_timeline: 5, status: 3 },
      data: [null, 1, 1, 2, 3].map((work_status, index) => ({
        ...data.data.data[0],
        id: index + 10,
        work_status,
      })),
    },
  };
}
export function sourceResponse(url: string, quoteId = 140, projectId = 86) {
  if (url.endsWith('/show_quote'))
    return response({
      status: true,
      data: { id: quoteId, project: { id: projectId, title: 'Courtyard' }, timeline_status: 3 },
    });
  if (url.endsWith('/fetch_project_timelines')) return response(overview());
  if (url.endsWith('/show_project_configuration'))
    return response({
      status: true,
      data: { start_date: null, holidays: [], work_status: 2, responsible_employee_id: 4 },
    });
  if (url.endsWith('/fetch_project_timeline_stage_reports'))
    return response({ status: true, data: [report()] });
  if (url.endsWith('/fetch_project_timeline_stage_tasks'))
    return response({ status: true, data: [task(true)] });
  if (url.endsWith('/fetch_project_timeline_stage_meetings'))
    return response({ status: true, data: [activity()] });
  if (url.endsWith('/fetch_shop_drawing_quotes'))
    return response({ status: true, data: [drawing(quoteId, projectId)] });
  if (url.endsWith('/fetch_purchase_requests'))
    return response({
      status: true,
      data: [{ ...requestRecord(), quote_id: quoteId, project_id: projectId }],
    });
  throw new Error(`Unexpected network request: ${url}`);
}
