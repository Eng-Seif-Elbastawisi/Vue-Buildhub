import type EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';
import {
  responseObject,
  responseId,
  responseText,
  nullableText,
  employeeReference,
} from './work-items.response';
import { type SiteSafetyStatus } from '../constants/work-items.constants';
export default class DailyReportModel {
  public readonly id: number;
  public readonly projectTimelineStageId: number;
  public readonly employee: EmployeeModel;
  public readonly createdAt: string | null;
  public readonly date: string;
  public readonly notes: string | null;
  public readonly siteSafetyStatus: SiteSafetyStatus;
  constructor(record: {
    id: number;
    projectTimelineStageId: number;
    employee: EmployeeModel;
    createdAt: string | null;
    date: string;
    notes: string | null;
    siteSafetyStatus: SiteSafetyStatus;
  }) {
    this.id = record.id;
    this.projectTimelineStageId = record.projectTimelineStageId;
    this.employee = record.employee;
    this.createdAt = record.createdAt;
    this.date = record.date;
    this.notes = record.notes;
    this.siteSafetyStatus = record.siteSafetyStatus;
  }
  static fromJson(payload: unknown): DailyReportModel {
    const record = responseObject(payload);
    if (
      ![1, 2, 3].includes(Number(record.site_safety_status)) ||
      typeof record.site_safety_status !== 'number'
    )
      throw new Error('work_items.invalid_response');
    return new DailyReportModel({
      id: responseId(record.id),
      projectTimelineStageId: responseId(record.project_timeline_stage_id),
      employee: employeeReference(record.employee),
      createdAt: nullableText(record.created_at),
      date: responseText(record.date),
      notes: nullableText(record.notes),
      siteSafetyStatus: record.site_safety_status as SiteSafetyStatus,
    });
  }
}
