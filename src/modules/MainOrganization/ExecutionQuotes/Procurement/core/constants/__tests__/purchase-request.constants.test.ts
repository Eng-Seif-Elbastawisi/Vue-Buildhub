import { expect, it } from 'vitest';
import {
  isItemType,
  isPriority,
  isStatus,
  isSupplyResponsibility,
  priorityKey,
  statusKey,
} from '../purchase-request.constants';
it.each([1, 2])('accepts confirmed supply responsibility %s', (value) =>
  expect(isSupplyResponsibility(value)).toBe(true),
);
it.each([
  [1, 'normal', 'pending'],
  [2, 'low', 'rejected'],
  [3, 'high', 'confirmed'],
] as const)('maps priority and status %s according to the backend', (value, priority, status) => {
  expect(isPriority(value)).toBe(true);
  expect(isStatus(value)).toBe(true);
  expect(priorityKey(value)).toBe(`procurement.${priority}`);
  expect(statusKey(value)).toBe(`procurement.${status}`);
});
it.each(['material', 'product'])('accepts confirmed item type %s', (type) =>
  expect(isItemType(type)).toBe(true),
);
it.each([0, 4, '1', null])('rejects unsupported enum value %s', (value) => {
  expect(isPriority(value)).toBe(false);
  expect(isStatus(value)).toBe(false);
  expect(isSupplyResponsibility(value)).toBe(false);
  expect(isItemType(value)).toBe(false);
});
