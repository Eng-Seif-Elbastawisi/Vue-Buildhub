import { expect, it } from 'vitest';
import {
  calendarPeriod,
  reportMetrics,
  activityDistribution,
  timelineDistribution,
  procurementDistribution,
  assignedTasks,
  isDateOnly,
} from '../analytics.metrics';
import ProjectTimelineOverviewModel from '../../../../Schedule/core/models/project.timeline.overview.model';
import DailyReportModel from '../../../../WorkItems/core/models/report.model';
import WorkTaskModel from '../../../../WorkItems/core/models/task.model';
import WorkActivityModel from '../../../../WorkItems/core/models/activity.model';
import PurchaseRequestModel from '../../../../Procurement/core/models/purchase-request.model';
import { requestRecord } from '../../../../Procurement/__tests__/fixtures';
import { overview, report, task, activity } from '../../../__tests__/fixtures';
const period = calendarPeriod(7, '2026-10-19');
it('counts all groups including multiple START and preserves approval as a separate state', () => {
  const model = ProjectTimelineOverviewModel.fromJson(overview().data);
  const buckets = timelineDistribution(model.projectTimelines);
  expect(buckets?.map((bucket) => bucket.count)).toEqual([1, 2, 1, 1]);
  expect(buckets?.reduce((sum, bucket) => sum + bucket.count, 0)).toBe(model.count);
  expect(buckets?.[3]?.label).toBe('intelligence.stop');
  expect(model.status).toBe(3);
  const missing = overview();
  delete missing.data.data[0]?.work_status;
  expect(
    timelineDistribution(ProjectTimelineOverviewModel.fromJson(missing.data).projectTimelines),
  ).toBeNull();
});
it('buckets report.date inclusively without converting it to a browser timezone', () => {
  const rows = [
    report(1, period.from, 1),
    report(2, period.to, 3),
    report(3, period.to, 3),
    report(4, '2026-10-12', 2),
  ].map(DailyReportModel.fromJson);
  const metrics = reportMetrics(rows, period);
  expect(period).toEqual({ from: '2026-10-13', to: '2026-10-19' });
  expect(metrics?.trend).toHaveLength(7);
  expect(metrics?.trend.map((bucket) => bucket.count)).toEqual([1, 0, 0, 0, 0, 0, 2]);
  expect(metrics?.count).toBe(3);
  expect(metrics?.flagged).toBe(2);
  expect(metrics?.incidents).toBe(2); // Two reports, even if describing the same incident.
  expect(metrics?.safety.map((bucket) => bucket.count)).toEqual([1, 0, 2]);
  expect(rows[0]?.projectTimelineStageId).toBe(18);
  expect(rows[0]?.employee.id).toBe(4);
});
it('successful empty sets yield zeros and missing dates remain unavailable', () => {
  expect(reportMetrics([], period)?.count).toBe(0);
  expect(timelineDistribution([])?.map((bucket) => bucket.count)).toEqual([0, 0, 0, 0]);
  expect(
    reportMetrics([DailyReportModel.fromJson(report(1, '2026-10-19T00:00:00Z'))], period),
  ).toBeNull();
  expect(activityDistribution([WorkActivityModel.fromJson(activity(1, null))], period)).toBeNull();
});
it.each(['2026-02-30', '2026-10-19 00:00:00', '2026-10-19T00:00:00-10:00', null])(
  'rejects ambiguous/invalid date-only values: %s',
  (date) => expect(isDateOnly(date)).toBe(false),
);
it('keeps procurement decisions and task assignments separate from receiving and completion', () => {
  const rows = [1, 2, 3, 1].map((status, index) =>
    PurchaseRequestModel.fromJson({ ...requestRecord(), id: index + 1, status }),
  );
  expect(procurementDistribution(rows).map((bucket) => [bucket.label, bucket.count])).toEqual([
    ['intelligence.pending', 2],
    ['intelligence.rejected', 1],
    ['intelligence.confirmed', 1],
  ]);
  const tasks = [WorkTaskModel.fromJson(task()), WorkTaskModel.fromJson({ ...task(true), id: 6 })];
  expect(assignedTasks(tasks)).toBe(1);
  expect(tasks[1]).not.toHaveProperty('status');
  expect(rows[0]?.quoteId).toBe(140);
  expect(rows[0]?.projectId).toBe(86);
  expect(rows[0]?.items[0]?.projectTimelineStageId).toBe(17);
});
it('counts record categories in the period without inventing lifecycle states', () => {
  const records = [1, 2, 3, 4].map((type) => WorkActivityModel.fromJson(activity(type)));
  expect(activityDistribution(records, period)?.map((bucket) => bucket.count)).toEqual([
    1, 1, 1, 1,
  ]);
  expect(
    activityDistribution(records, calendarPeriod(7, '2026-09-01'))?.map((bucket) => bucket.count),
  ).toEqual([0, 0, 0, 0]);
});
