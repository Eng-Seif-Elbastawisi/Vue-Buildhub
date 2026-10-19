import type ScheduleGroupModel from '../../../Schedule/core/models/schedule.group.model';
import type DailyReportModel from '../../../WorkItems/core/models/report.model';
import type WorkActivityModel from '../../../WorkItems/core/models/activity.model';
import type WorkTaskModel from '../../../WorkItems/core/models/task.model';
import type PurchaseRequestModel from '../../../Procurement/core/models/purchase-request.model';

export interface AnalyticsBucket {
  key: string;
  label: string;
  count: number;
}
export interface AnalyticsPeriod {
  from: string;
  to: string;
}
const dayMs = 86_400_000;
export function calendarPeriod(
  days: number,
  today = new Date().toISOString().slice(0, 10),
): AnalyticsPeriod {
  return {
    from: new Date(Date.parse(`${today}T00:00:00Z`) - (days - 1) * dayMs)
      .toISOString()
      .slice(0, 10),
    to: today,
  };
}
export function isDateOnly(value: string | null): value is string {
  return (
    value !== null &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(`${value}T00:00:00Z`)) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value
  );
}
export function inPeriod(date: string, period: AnalyticsPeriod) {
  return date >= period.from && date <= period.to;
}
function buckets(values: readonly (number | null)[], labels: readonly string[]): AnalyticsBucket[] {
  return labels.map((label, index) => ({
    key: String(index),
    label: `intelligence.${label}`,
    count: values.filter((value) => value === (index === 0 ? null : index)).length,
  }));
}
export function timelineDistribution(
  groups: readonly ScheduleGroupModel[],
): AnalyticsBucket[] | null {
  // An omitted status is unknown; only explicit null means not started.
  if (groups.some((group) => group.workStatus === undefined)) return null;
  return buckets(
    groups.map((group) => group.workStatus ?? null),
    ['not_started', 'start', 'hold', 'stop'],
  );
}
export function reportMetrics(reports: readonly DailyReportModel[], period: AnalyticsPeriod) {
  if (reports.some((report) => !isDateOnly(report.date))) return null;
  const selected = reports.filter((report) => inPeriod(report.date, period));
  const days = Math.round((Date.parse(period.to) - Date.parse(period.from)) / dayMs) + 1;
  const trend = Array.from({ length: days }, (_, index) => {
    const date = new Date(Date.parse(`${period.from}T00:00:00Z`) + index * dayMs)
      .toISOString()
      .slice(0, 10);
    return {
      key: date,
      label: date,
      count: selected.filter((report) => report.date === date).length,
    };
  });
  return {
    count: selected.length,
    flagged: selected.filter(
      (report) => report.siteSafetyStatus === 2 || report.siteSafetyStatus === 3,
    ).length,
    incidents: selected.filter((report) => report.siteSafetyStatus === 3).length,
    trend,
    safety: buckets(
      selected.map((report) => report.siteSafetyStatus),
      ['unused', 'ok', 'observation', 'incident'],
    ).slice(1),
  };
}
export function activityDistribution(
  records: readonly WorkActivityModel[],
  period: AnalyticsPeriod,
) {
  if (records.some((record) => !isDateOnly(record.date))) return null;
  return buckets(
    records
      .filter((record) => record.date !== null && inPeriod(record.date, period))
      .map((record) => record.type),
    ['unused', 'meeting', 'issue', 'risk', 'delay'],
  ).slice(1);
}
export function procurementDistribution(records: readonly PurchaseRequestModel[]) {
  return buckets(
    records.map((record) => record.status),
    ['unused', 'pending', 'rejected', 'confirmed'],
  ).slice(1);
}
export function assignedTasks(records: readonly WorkTaskModel[]) {
  return records.filter((record) => record.assignedEmployee !== null).length;
}
