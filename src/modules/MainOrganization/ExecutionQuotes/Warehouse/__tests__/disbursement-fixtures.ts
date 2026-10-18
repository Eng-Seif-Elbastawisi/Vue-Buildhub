export function stockRecord(id = 9, available = '4.00') {
  return {
    purchase_request_item: { id, quantity: '10.00', title: `Item ${id}` },
    received_quantity: '10.00',
    disbursed_quantity: '6.00',
    available_quantity: available,
  };
}

export function disbursementRecord() {
  return {
    id: 1,
    quote_id: 140,
    project_id: 86,
    type: 1,
    receiver: { id: 7, name: 'Receiver', type: 2 },
    organization_employee: { id: 1, name: 'Issuer', type: 1 },
    date: '2026-10-15',
    notes: 'Site work',
    items: [
      { id: 1, purchase_request_item: { id: 9, title: 'Item 9' }, quantity: '1.50' },
      { id: 2, purchase_request_item: { id: 9, title: 'Item 9' }, quantity: '2.00' },
    ],
    created_at: '2026-10-15 13:32:27',
  };
}
