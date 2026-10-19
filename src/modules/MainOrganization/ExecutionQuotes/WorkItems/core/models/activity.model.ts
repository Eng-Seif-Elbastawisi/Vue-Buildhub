import type EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';
import {
  responseObject,
  responseId,
  responseText,
  nullableText,
  employeeReference,
  optionalEmployee,
} from './work-items.response';
import { type WorkActivityType, type MeetingAudienceType } from '../constants/work-items.constants';
export default class WorkActivityModel {
  readonly meetingAudienceType: MeetingAudienceType | null;
  readonly result: string | null;
  readonly attendees: EmployeeModel[];
  public readonly id: number;
  public readonly projectTimelineStageId: number;
  public readonly employee: EmployeeModel;
  public readonly createdAt: string | null;
  public readonly title: string;
  public readonly date: string | null;
  public readonly description: string | null;
  public readonly assignedEmployee: EmployeeModel | null;
  public readonly type: WorkActivityType;
  constructor(record: {
    meetingAudienceType?: MeetingAudienceType | null;
    result?: string | null;
    attendees?: EmployeeModel[];
    id: number;
    projectTimelineStageId: number;
    employee: EmployeeModel;
    createdAt: string | null;
    title: string;
    date: string | null;
    description: string | null;
    assignedEmployee: EmployeeModel | null;
    type: WorkActivityType;
  }) {
    this.id = record.id;
    this.meetingAudienceType = record.meetingAudienceType ?? null;
    this.result = record.result ?? null;
    this.attendees = record.attendees ?? [];
    this.projectTimelineStageId = record.projectTimelineStageId;
    this.employee = record.employee;
    this.createdAt = record.createdAt;
    this.title = record.title;
    this.date = record.date;
    this.description = record.description;
    this.assignedEmployee = record.assignedEmployee;
    this.type = record.type;
  }
  static fromJson(payload: unknown): WorkActivityModel {
    const record = responseObject(payload);
    if (![1, 2, 3, 4].includes(Number(record.type)) || typeof record.type !== 'number')
      throw new Error('work_items.invalid_response');
    if (
      record.meeting_audience_type != null &&
      record.meeting_audience_type !== 1 &&
      record.meeting_audience_type !== 2
    )
      throw new Error('work_items.invalid_response');
    if (record.attendees != null && !Array.isArray(record.attendees))
      throw new Error('work_items.invalid_response');
    return new WorkActivityModel({
      meetingAudienceType:
        (record.meeting_audience_type as MeetingAudienceType | null | undefined) ?? null,
      result: nullableText(record.result),
      attendees: (record.attendees ?? []).map(employeeReference),
      id: responseId(record.id),
      projectTimelineStageId: responseId(record.project_timeline_stage_id),
      employee: employeeReference(record.employee),
      createdAt: nullableText(record.created_at),
      title: responseText(record.title),
      date: nullableText(record.date),
      description: nullableText(record.description),
      assignedEmployee: optionalEmployee(record.assigned_employee),
      type: record.type as WorkActivityType,
    });
  }
}
