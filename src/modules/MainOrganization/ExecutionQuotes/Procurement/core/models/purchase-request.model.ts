import type EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';
import {
  responseObject,
  responseId,
  nullableText,
  optionalEmployee,
} from '../../../WorkItems/core/models/work-items.response';
import {
  isPriority,
  isStatus,
  isSupplyResponsibility,
  type PurchaseRequestPriority,
  type PurchaseRequestStatus,
  type SupplyResponsibility,
} from '../constants/purchase-request.constants';
import PurchaseRequestItemModel from './purchase-request.item.model';

export default class PurchaseRequestModel {
  readonly id: number;
  readonly employee: EmployeeModel | null;
  readonly assignedEmployee: EmployeeModel | null;
  readonly quoteId: number;
  readonly projectId: number;
  readonly isAllProject: boolean;
  readonly projectFloorSpaceId: number | null;
  // The non-null relation schema is undocumented; preserve it without guessing display fields.
  readonly projectFloorSpace: unknown;
  readonly supplyResponsibility: SupplyResponsibility;
  readonly priority: PurchaseRequestPriority;
  readonly status: PurchaseRequestStatus;
  readonly items: PurchaseRequestItemModel[];
  readonly createdAt: string | null;
  constructor(fields: {
    id: number;
    employee: EmployeeModel | null;
    assignedEmployee: EmployeeModel | null;
    quoteId: number;
    projectId: number;
    isAllProject: boolean;
    projectFloorSpaceId: number | null;
    projectFloorSpace: unknown;
    supplyResponsibility: SupplyResponsibility;
    priority: PurchaseRequestPriority;
    status: PurchaseRequestStatus;
    items: PurchaseRequestItemModel[];
    createdAt: string | null;
  }) {
    this.id = fields.id;
    this.employee = fields.employee;
    this.assignedEmployee = fields.assignedEmployee;
    this.quoteId = fields.quoteId;
    this.projectId = fields.projectId;
    this.isAllProject = fields.isAllProject;
    this.projectFloorSpaceId = fields.projectFloorSpaceId;
    this.projectFloorSpace = fields.projectFloorSpace;
    this.supplyResponsibility = fields.supplyResponsibility;
    this.priority = fields.priority;
    this.status = fields.status;
    this.items = fields.items;
    this.createdAt = fields.createdAt;
  }
  static fromJson(payload: unknown): PurchaseRequestModel {
    const record = responseObject(payload);
    if (
      typeof record.is_all_project !== 'boolean' ||
      !isSupplyResponsibility(record.supply_responsibility) ||
      !isPriority(record.priority) ||
      !isStatus(record.status) ||
      !Array.isArray(record.items)
    )
      throw new Error('procurement.invalid_response');
    return new PurchaseRequestModel({
      id: responseId(record.id),
      employee: optionalEmployee(record.employee),
      assignedEmployee: optionalEmployee(record.assigned_employee),
      quoteId: responseId(record.quote_id),
      projectId: responseId(record.project_id),
      isAllProject: record.is_all_project,
      projectFloorSpaceId:
        record.project_floor_space_id == null ? null : responseId(record.project_floor_space_id),
      projectFloorSpace: record.project_floor_space,
      supplyResponsibility: record.supply_responsibility,
      priority: record.priority,
      status: record.status,
      items: record.items.map(PurchaseRequestItemModel.fromJson),
      createdAt: nullableText(record.created_at),
    });
  }
}
