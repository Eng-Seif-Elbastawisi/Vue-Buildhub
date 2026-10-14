import TitleModel from '@/base/Core/Models/titleModel';
import EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';
import {
  responseId,
} from '../../../WorkItems/core/models/work-items.response';
import PurchaseOrderRequestModel from './purchase.order.request.model';
import PurchaseOrderPriceModel from './purchase.order.price.model';
export default class PurchaseOrderModel {
  public readonly id: number;
  public readonly purchaseRequest: PurchaseOrderRequestModel;
  public readonly purchaseRequestPrice: PurchaseOrderPriceModel;
  public readonly employee: EmployeeModel;
  public readonly supplier: TitleModel;
  public readonly client: TitleModel;
  public readonly status: 3;
  public readonly date: string;
  public readonly note: string | null;
  public readonly file: string | null;
  public readonly isOrderPaid: boolean;
  public readonly createdAt: string;
  constructor(fields: {
    id: number;
    purchaseRequest: PurchaseOrderRequestModel;
    purchaseRequestPrice: PurchaseOrderPriceModel;
    employee: EmployeeModel;
    supplier: TitleModel;
    client: TitleModel;
    status: 3;
    date: string;
    note: string | null;
    file: string | null;
    isOrderPaid: boolean;
    createdAt: string;
  }) {
    this.id = fields.id;
    this.purchaseRequest = fields.purchaseRequest;
    this.purchaseRequestPrice = fields.purchaseRequestPrice;
    this.employee = fields.employee;
    this.supplier = fields.supplier;
    this.client = fields.client;
    this.status = fields.status;
    this.date = fields.date;
    this.note = fields.note;
    this.file = fields.file;
    this.isOrderPaid = fields.isOrderPaid;
    this.createdAt = fields.createdAt;
  }
  static fromJson(payload: Record<string, unknown>): PurchaseOrderModel {

    return new PurchaseOrderModel({
      id: responseId(payload.id),
      purchaseRequest: PurchaseOrderRequestModel.fromJson(payload.purchase_request as Record<string, unknown>),
      purchaseRequestPrice: PurchaseOrderPriceModel.fromJson(payload.purchase_request_price as Record<string, unknown>),
      employee: EmployeeModel.fromJson(payload.employee as Record<string, unknown>),
      supplier: TitleModel.fromMap(payload.supplier),
      client: TitleModel.fromMap(payload.client),
      status: payload.status as 3,
      date: payload.date as string,
      note: payload.note as string | null,
      file: payload.file as string | null,
      isOrderPaid: payload.is_order_paid as boolean,
      createdAt: payload.created_at as string,
    });
  }
}
