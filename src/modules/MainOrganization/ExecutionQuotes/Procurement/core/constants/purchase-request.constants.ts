export const SupplyResponsibility = {
  CLIENT: 1,
  COMPANY: 2,
} as const;
export type SupplyResponsibility = (typeof SupplyResponsibility)[keyof typeof SupplyResponsibility];
export const PurchaseRequestPriority = {
  NORMAL: 1,
  LOW: 2,
  HIGH: 3,
} as const;
export type PurchaseRequestPriority =
  (typeof PurchaseRequestPriority)[keyof typeof PurchaseRequestPriority];
export const PurchaseRequestStatus = {
  PENDING: 1,
  REJECTED: 2,
  CONFIRMED: 3,
} as const;
export type PurchaseRequestStatus =
  (typeof PurchaseRequestStatus)[keyof typeof PurchaseRequestStatus];
export type PurchaseRequestItemType = 'material' | 'product';
export const isItemType = (type: unknown): type is PurchaseRequestItemType =>
  type === 'material' || type === 'product';
export const isSupplyResponsibility = (value: unknown): value is SupplyResponsibility =>
  value === SupplyResponsibility.CLIENT || value === SupplyResponsibility.COMPANY;
export const isPriority = (value: unknown): value is PurchaseRequestPriority =>
  value === PurchaseRequestPriority.NORMAL ||
  value === PurchaseRequestPriority.LOW ||
  value === PurchaseRequestPriority.HIGH;
export const isStatus = (value: unknown): value is PurchaseRequestStatus =>
  value === PurchaseRequestStatus.PENDING ||
  value === PurchaseRequestStatus.REJECTED ||
  value === PurchaseRequestStatus.CONFIRMED;
export const statusKey = (status: PurchaseRequestStatus) =>
  ({
    [PurchaseRequestStatus.PENDING]: 'procurement.pending',
    [PurchaseRequestStatus.REJECTED]: 'procurement.rejected',
    [PurchaseRequestStatus.CONFIRMED]: 'procurement.confirmed',
  })[status];
export const priorityKey = (priority: PurchaseRequestPriority) =>
  ({
    [PurchaseRequestPriority.NORMAL]: 'procurement.normal',
    [PurchaseRequestPriority.LOW]: 'procurement.low',
    [PurchaseRequestPriority.HIGH]: 'procurement.high',
  })[priority];
