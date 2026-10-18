import { describe, expect, it } from 'vitest';
import PurchaseRequestReceiptItemSummaryModel from '../purchase-request-receipt-item-summary.model';
import PurchaseRequestReceiptModel from '../purchase-request-receipt.model';
import { requestRecord } from '../../../../Procurement/__tests__/fixtures';

const item = requestRecord().items[0];
const summary = (remaining: string) => ({
  purchase_request_item: item,
  requested_quantity: '10.00',
  received_quantity: remaining === '0.00' ? '10.00' : '6.00',
  remaining_quantity: remaining,
});
const receipt = (id: number, status: 1 | 2) => ({
  id,
  purchase_request_id: 1,
  quote_id: 140,
  project_id: 86,
  employee: { id: 7, name: 'Receiver', type: 2 },
  organization_employee: { id: 1, name: 'Recorder', type: 1 },
  status,
  date: '2026-10-15',
  items: [{ id, purchase_request_item: requestRecord().items[0], quantity: '1.00' }],
  created_at: '2026-10-15 08:06:17',
});
describe('receiving response models', () => {
  it('maps summary nested request item, timeline association and decimal strings', () => {
    const model = PurchaseRequestReceiptItemSummaryModel.fromJson(summary('4.00'));
    expect(model.purchaseRequestItem.id).toBe(1);
    expect(model.purchaseRequestItem.projectTimelineStage?.projectTimelineStageId).toBe(17);
    expect(model.purchaseRequestItem.projectTimelineStage?.stage?.id).toBe(129);
    expect([model.requestedQuantity, model.receivedQuantity, model.remainingQuantity]).toEqual([
      '10.00',
      '6.00',
      '4.00',
    ]);
    expect(model.canReceive).toBe(true);
    expect(PurchaseRequestReceiptItemSummaryModel.fromJson(summary('0.00')).canReceive).toBe(false);
  });
  it('preserves receipt item IDs, both employee roles, and historical status snapshots', () => {
    const first = PurchaseRequestReceiptModel.fromJson(receipt(3, 1));
    const later = PurchaseRequestReceiptModel.fromJson(receipt(5, 2));
    expect(first.items[0]?.id).toBe(3);
    expect(first.items[0]?.purchaseRequestItem.id).toBe(1);
    expect(first.employee?.name).toBe('Receiver');
    expect(first.organizationEmployee.name).toBe('Recorder');
    expect([first.status, later.status]).toEqual([1, 2]);
    expect([first, later].map((record) => record.items[0]?.purchaseRequestItem.id)).toEqual([1, 1]);
  });
});
