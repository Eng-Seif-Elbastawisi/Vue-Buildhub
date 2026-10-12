import type EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';
import {
  responseObject,
  responseId,
  responseText,
  nullableText,
  employeeReference,
  optionalEmployee,
} from './work-items.response';

export default class WorkTaskModel {
  public readonly id: number;
  public readonly projectTimelineStageId: number;
  public readonly employee: EmployeeModel;
  public readonly createdAt: string | null;
  public readonly title: string;
  public readonly assignedEmployee: EmployeeModel | null;
  public readonly endDate: string | null;
  constructor(record: {
    id: number;
    projectTimelineStageId: number;
    employee: EmployeeModel;
    createdAt: string | null;
    title: string;
    assignedEmployee: EmployeeModel | null;
    endDate: string | null;
  }) {
    this.id = record.id;
    this.projectTimelineStageId = record.projectTimelineStageId;
    this.employee = record.employee;
    this.createdAt = record.createdAt;
    this.title = record.title;
    this.assignedEmployee = record.assignedEmployee;
    this.endDate = record.endDate;
  }
  static fromJson(payload: unknown): WorkTaskModel {
    const record = responseObject(payload);

    return new WorkTaskModel({
      id: responseId(record.id),
      projectTimelineStageId: responseId(record.project_timeline_stage_id),
      employee: employeeReference(record.employee),
      createdAt: nullableText(record.created_at),
      title: responseText(record.title),
      assignedEmployee: optionalEmployee(record.assigned_employee),
      endDate: nullableText(record.end_date),
    });
  }
}
