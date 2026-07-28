import type { InsideStatusType } from '@/modules/MainOrganization/TaskAssignment/core/constants/inside.status.enum';
import OrganizationEmployeeModel from '@/modules/shared/Organization/core/models/employee.model';

export default class ProjectHistoryModel { 
  public readonly id?: number;
  public readonly status?: InsideStatusType;
  public readonly employee?: OrganizationEmployeeModel;
  public readonly history_employees?: ProjectHistoryModel[];
  public readonly created_at?: string;

  constructor(data: {
    id?: number;
    status?: InsideStatusType;
    employee?: OrganizationEmployeeModel;
    history_employees?: ProjectHistoryModel[];
    created_at?: string;
  }) {
    this.id = data.id;
    this.status = data.status;
    this.employee = data.employee;
    this.history_employees = data.history_employees;
    this.created_at = data.created_at;
    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): ProjectHistoryModel {
    if (!json) throw new Error('Invalid ProjectHistoryModel data');

    return new ProjectHistoryModel({
      id: json.id as number | undefined,
      status: json.status as InsideStatusType | undefined,
      employee: OrganizationEmployeeModel.fromJson(json.employee as Record<string, unknown> | undefined),
      history_employees: (json.history_employees as Record<string, unknown>[] ?? []).map((employee) => ProjectHistoryModel.fromJson(employee)),
      created_at: json.created_at as string | undefined,
    });
  }

  static example: ProjectHistoryModel = new ProjectHistoryModel({
    id: 1,
    status: 1,
    employee: OrganizationEmployeeModel.example,
    history_employees: [],
    created_at: '2026-07-28 12:37:26',
  });
}
