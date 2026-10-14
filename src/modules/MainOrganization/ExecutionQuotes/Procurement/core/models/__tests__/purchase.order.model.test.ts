import { expect, it } from 'vitest';
import TitleModel from '@/base/Core/Models/titleModel';
import PurchaseOrderModel from '../purchase.order.model';
import { orderRecord } from '../../../__tests__/order-fixtures';
it('maps the single order and named relations without converting decimal price', () => {
  const order = PurchaseOrderModel.fromJson(orderRecord());
  expect(order.purchaseRequest).toMatchObject({ id: 1, quoteId: 140, projectId: 86, status: 3 });
  expect(order.purchaseRequestPrice).toMatchObject({
    id: 15,
    price: '1500.00',
    duration: 2,
    durationType: 2,
  });
  expect(order.employee.name).toBe('Techlab Employee');
  expect(order.supplier).toBeInstanceOf(TitleModel);
  expect(order.client).toBeInstanceOf(TitleModel);
  expect(order.supplier.title).toBe('Supplier 3');
  expect(order.isOrderPaid).toBe(false);
  expect(order.note).toBeNull();
  expect(order.file).toBeNull();
});
it.each([
  [],
  { ...orderRecord(), status: 1 },
  {
    ...orderRecord(),
    purchase_request_price: { id: 15, price: 1500, duration: 2, duration_type: 2 },
  },
])('rejects invalid order shapes', (payload) => {
  expect(() => PurchaseOrderModel.fromJson(payload)).toThrow();
});
