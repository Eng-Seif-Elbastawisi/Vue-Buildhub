import type EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';
import {
  responseObject,
  responseId,
  responseText,
  employeeReference,
  optionalEmployee,
} from '../../../WorkItems/core/models/work-items.response';
import PurchaseRequestReceiptHistoryItemModel from './purchase-request-receipt-history-item.model';

export default class PurchaseRequestReceiptModel {
  public readonly id: number;
  public readonly purchaseRequestId: number;
  public readonly quoteId: number;
  public readonly projectId: number;
  public readonly employee: EmployeeModel | null;
  public readonly organizationEmployee: EmployeeModel;
  public readonly status: 1 | 2;
  public readonly date: string;
  public readonly items: PurchaseRequestReceiptHistoryItemModel[];
  public readonly createdAt: string;
  constructor(
    id: number,
    purchaseRequestId: number,
    quoteId: number,
    projectId: number,
    employee: EmployeeModel | null,
    organizationEmployee: EmployeeModel,
    status: 1 | 2,
    date: string,
    items: PurchaseRequestReceiptHistoryItemModel[],
    createdAt: string,
  ) {
    this.id = id;
    this.purchaseRequestId = purchaseRequestId;
    this.quoteId = quoteId;
    this.projectId = projectId;
    this.employee = employee;
    this.organizationEmployee = organizationEmployee;
    this.status = status;
    this.date = date;
    this.items = items;
    this.createdAt = createdAt;
  }
  static fromJson(payload: unknown) {
    const record = responseObject(payload);
    if ((record.status !== 1 && record.status !== 2) || !Array.isArray(record.items))
      throw new Error('material_receipt.invalid_response');
    return new PurchaseRequestReceiptModel(
      responseId(record.id),
      responseId(record.purchase_request_id),
      responseId(record.quote_id),
      responseId(record.project_id),
      optionalEmployee(record.employee),
      employeeReference(record.organization_employee),
      record.status,
      responseText(record.date),
      record.items.map(PurchaseRequestReceiptHistoryItemModel.fromJson),
      responseText(record.created_at),
    );
  }
}
