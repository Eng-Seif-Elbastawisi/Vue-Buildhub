import { expect, it } from 'vitest';
import EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';
import { disbursementRecord } from '../../../__tests__/disbursement-fixtures';
import PurchaseRequestDisbursementModel from '../purchase-request-disbursement.model';

it('maps receiver and issuer separately and preserves repeated historical items', () => {
  const entry = PurchaseRequestDisbursementModel.fromJson(disbursementRecord());
  expect(entry.receiver).toBeInstanceOf(EmployeeModel);
  expect(entry.organizationEmployee).toBeInstanceOf(EmployeeModel);
  expect([entry.receiver.id, entry.organizationEmployee.id]).toEqual([7, 1]);
  expect(entry.items.map((item) => item.id)).toEqual([1, 2]);
  expect(entry.items.map((item) => item.purchaseRequestItem.id)).toEqual([9, 9]);
  expect(entry.type).toBe(1);
  expect(entry.notes).toBe('Site work');
});

it('rejects unconfirmed disbursement types and non-array history items', () => {
  expect(() =>
    PurchaseRequestDisbursementModel.fromJson({ ...disbursementRecord(), type: 2 }),
  ).toThrow();
  expect(() =>
    PurchaseRequestDisbursementModel.fromJson({ ...disbursementRecord(), items: {} }),
  ).toThrow();
});
