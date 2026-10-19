import EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';
import { validId } from '../constants/schedule.constants';
import {
  isWorkReason,
  isWorkStatus,
  type TimelineWorkReason,
  type TimelineWorkStatus,
} from '../constants/timeline.status';
import { responseObject } from './schedule.response';

export default class ProjectTimelineHistoryModel {
  public readonly id: number;
  public readonly projectTimelineId: number;
  public readonly status: TimelineWorkStatus;
  public readonly reason: TimelineWorkReason | null;
  public readonly note: string | null;
  public readonly organizationEmployee: EmployeeModel | null;
  public readonly createdAt: string;
  constructor(
    id: number,
    projectTimelineId: number,
    status: TimelineWorkStatus,
    reason: TimelineWorkReason | null,
    note: string | null,
    organizationEmployee: EmployeeModel | null,
    createdAt: string,
  ) {
    this.id = id;
    this.projectTimelineId = projectTimelineId;
    this.status = status;
    this.reason = reason;
    this.note = note;
    this.organizationEmployee = organizationEmployee;
    this.createdAt = createdAt;
  }
  static fromJson(value: unknown) {
    const data = responseObject(value);
    const employee =
      data.organization_employee == null ? null : responseObject(data.organization_employee);
    if (
      !validId(Number(data.id)) ||
      !validId(Number(data.project_timeline_id)) ||
      !isWorkStatus(data.status) ||
      (data.reason !== null && !isWorkReason(data.reason)) ||
      (data.note !== null && typeof data.note !== 'string') ||
      typeof data.created_at !== 'string' ||
      (employee !== null &&
        (!validId(Number(employee.id)) ||
          typeof employee.name !== 'string' ||
          typeof employee.type !== 'number'))
    )
      throw new Error('schedule.invalid_response');
    return new ProjectTimelineHistoryModel(
      Number(data.id),
      Number(data.project_timeline_id),
      data.status,
      data.reason as TimelineWorkReason | null,
      data.note as string | null,
      employee === null ? null : EmployeeModel.fromJson(employee),
      data.created_at,
    );
  }
}
