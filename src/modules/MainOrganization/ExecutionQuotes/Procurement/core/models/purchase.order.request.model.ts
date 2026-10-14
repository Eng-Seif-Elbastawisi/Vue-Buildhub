
import { type PurchaseRequestStatus } from '../constants/purchase-request.constants';
export default class PurchaseOrderRequestModel {
  public readonly id: number;
  public readonly quoteId: number;
  public readonly projectId: number;
  public readonly status: PurchaseRequestStatus;
  constructor(id: number, quoteId: number, projectId: number, status: PurchaseRequestStatus) {
    this.id = id;
    this.quoteId = quoteId;
    this.projectId = projectId;
    this.status = status;
  }
  static fromJson(payload: Record<string, unknown>): PurchaseOrderRequestModel {
    return new PurchaseOrderRequestModel(
      payload.id as number,
      payload.quote_id as number,
      payload.project_id as number,
      payload.status as PurchaseRequestStatus,
    );
  }
}
