import { quotePath } from '../../Schedule/presentation/schedule.routes';
export function procurementPath(currentPath: string, quoteId: number) {
  return `${quotePath(currentPath, quoteId)}/procurement`;
}

export function purchaseOrderCreatePath(currentPath: string, quoteId: number) {
  return `${procurementPath(currentPath, quoteId)}/purchase-orders/add`;
}

export function purchaseRequestCreatePath(currentPath: string, quoteId: number) {
  return `${procurementPath(currentPath, quoteId)}/purchase-requests/add`;
}

export function supplierPricesPath(
  currentPath: string,
  quoteId: number,
  purchaseRequestId: number,
) {
  return `${procurementPath(currentPath, quoteId)}/purchase-requests/${purchaseRequestId}/supplier-prices`;
}
