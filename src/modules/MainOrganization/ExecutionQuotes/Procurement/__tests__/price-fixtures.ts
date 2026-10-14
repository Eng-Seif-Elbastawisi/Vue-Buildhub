import PurchaseRequestModel from '../core/models/purchase-request.model';
import PurchaseRequestController from '../presentation/controllers/purchase-request.controller';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { requestRecord } from './fixtures';
export function priceRecord(supplierId = 3, id = 15, purchaseRequestId = 1) {
  return {
    id,
    purchase_request_id: purchaseRequestId,
    supplier: { id: supplierId, name: `Supplier ${supplierId}` },
    price: '1500.00',
    duration: 2,
    duration_type: 2,
    created_at: '2026-10-13 13:25:49',
  };
}
export function activatePurchaseRequests() {
  const requests = PurchaseRequestController.getInstance();
  requests.activate(140);
  requests.listState.value = new DataSuccess({
    data: [1, 2].map((id) => PurchaseRequestModel.fromJson({ ...requestRecord(), id })),
  });
  return requests;
}
