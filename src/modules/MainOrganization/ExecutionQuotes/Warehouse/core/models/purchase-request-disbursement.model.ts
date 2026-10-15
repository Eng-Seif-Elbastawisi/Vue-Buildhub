import type EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';
import {
  employeeReference,
  nullableText,
  responseId,
  responseObject,
  responseText,
} from '../../../WorkItems/core/models/work-items.response';
import PurchaseRequestDisbursementHistoryItemModel from './purchase-request-disbursement-history-item.model';

export default class PurchaseRequestDisbursementModel {
  readonly id: number;
  readonly quoteId: number;
  readonly projectId: number;
  readonly type: 1;
  readonly receiver: EmployeeModel;
  readonly organizationEmployee: EmployeeModel;
  readonly date: string;
  readonly notes: string | null;
  readonly items: PurchaseRequestDisbursementHistoryItemModel[];
  readonly createdAt: string;

  constructor(
    id: number,
    quoteId: number,
    projectId: number,
    type: 1,
    receiver: EmployeeModel,
    organizationEmployee: EmployeeModel,
    date: string,
    notes: string | null,
    items: PurchaseRequestDisbursementHistoryItemModel[],
    createdAt: string,
  ) {
    this.id = id;
    this.quoteId = quoteId;
    this.projectId = projectId;
    this.type = type;
    this.receiver = receiver;
    this.organizationEmployee = organizationEmployee;
    this.date = date;
    this.notes = notes;
    this.items = items;
    this.createdAt = createdAt;
  }

  static fromJson(payload: unknown) {
    const record = responseObject(payload);
    if (record.type !== 1 || !Array.isArray(record.items))
      throw new Error('material_disbursement.invalid_response');
    return new PurchaseRequestDisbursementModel(
      responseId(record.id),
      responseId(record.quote_id),
      responseId(record.project_id),
      record.type,
      employeeReference(record.receiver),
      employeeReference(record.organization_employee),
      responseText(record.date),
      nullableText(record.notes),
      record.items.map(PurchaseRequestDisbursementHistoryItemModel.fromJson),
      responseText(record.created_at),
    );
  }
}
