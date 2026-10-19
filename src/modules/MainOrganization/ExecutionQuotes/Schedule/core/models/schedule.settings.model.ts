import EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';
import { isProjectWorkStatus, type ProjectWorkStatus } from '../constants/project.work-status';
import { weekdays } from '../constants/schedule.constants';
import { responseObject } from './schedule.response';

// Missing settings are represented by null state data, distinct from holidays: [].
export default class ProjectConfigurationModel {
  public readonly startDate: string | null | undefined;
  public readonly holidays: number[];
  public readonly id?: number;
  public readonly workStatus: ProjectWorkStatus | null | undefined;
  public readonly responsibleEmployeeId: number | null | undefined;
  public readonly responsibleEmployee: EmployeeModel | null | undefined;
  public readonly deliveryDate: string | null | undefined;
  public readonly siteCondition: string | null | undefined;
  public readonly createdAt: string | undefined;
  constructor(
    startDate: string | null | undefined,
    holidays: number[],
    fields: {
      id?: number;
      workStatus?: ProjectWorkStatus | null;
      responsibleEmployeeId?: number | null;
      responsibleEmployee?: EmployeeModel | null;
      deliveryDate?: string | null;
      siteCondition?: string | null;
      createdAt?: string;
    } = {},
  ) {
    this.startDate = startDate;
    this.holidays = holidays;
    this.id = fields.id;
    this.workStatus = fields.workStatus;
    this.responsibleEmployeeId = fields.responsibleEmployeeId;
    this.responsibleEmployee = fields.responsibleEmployee;
    this.deliveryDate = fields.deliveryDate;
    this.siteCondition = fields.siteCondition;
    this.createdAt = fields.createdAt;
  }
  static fromJson(response: unknown): ProjectConfigurationModel {
    const configuration = responseObject(response);
    if (
      (configuration.start_date !== null && typeof configuration.start_date !== 'string') ||
      !Array.isArray(configuration.holidays) ||
      !configuration.holidays.every(
        (day: unknown) => typeof day === 'number' && weekdays.some((weekday) => weekday === day),
      )
    )
      throw new Error('schedule.invalid_response');
    const { work_status, responsible_employee_id, responsible_employee } = configuration;
    if (
      (work_status != null && !isProjectWorkStatus(work_status)) ||
      (responsible_employee_id != null &&
        (typeof responsible_employee_id !== 'number' ||
          !Number.isInteger(responsible_employee_id) ||
          responsible_employee_id <= 0)) ||
      (configuration.delivery_date != null && typeof configuration.delivery_date !== 'string') ||
      (configuration.site_condition != null && typeof configuration.site_condition !== 'string') ||
      (configuration.created_at !== undefined && typeof configuration.created_at !== 'string') ||
      (configuration.id !== undefined && typeof configuration.id !== 'number')
    )
      throw new Error('schedule.invalid_response');
    let employee: EmployeeModel | null | undefined =
      responsible_employee === null ? null : undefined;
    if (responsible_employee != null) {
      const reference = responseObject(responsible_employee);
      if (
        typeof reference.id !== 'number' ||
        typeof reference.name !== 'string' ||
        typeof reference.type !== 'number'
      )
        throw new Error('schedule.invalid_response');
      employee = EmployeeModel.fromJson(reference);
    }
    return new ProjectConfigurationModel(configuration.start_date, [...configuration.holidays], {
      id: configuration.id as number | undefined,
      workStatus: work_status as ProjectWorkStatus | null | undefined,
      responsibleEmployeeId: responsible_employee_id as number | null | undefined,
      responsibleEmployee: employee,
      deliveryDate: configuration.delivery_date as string | null | undefined,
      siteCondition: configuration.site_condition as string | null | undefined,
      createdAt: configuration.created_at as string | undefined,
    });
  }
}
