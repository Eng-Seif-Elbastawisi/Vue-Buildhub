import { expect, it } from 'vitest';
import EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';
import QuoteEngineersModel from '../quote.engineers.model';
it('maps employee objects through the existing model and deduplicates IDs', () => {
  const model = QuoteEngineersModel.fromJson({
    employee: [
      { id: 7, name: 'A', email: 'a@b.com' },
      { id: 12, name: 'B' },
      { id: 7, name: 'A' },
    ],
  });
  expect(model.employee).toHaveLength(2);
  expect(model.employee[0]).toBeInstanceOf(EmployeeModel);
  expect(model.employee[1]?.name).toBe('B');
  expect(QuoteEngineersModel.fromJson({ employee: [] }).employee).toEqual([]);
});
it.each([{}, null, [], { employee: null }, { employee: [null] }, { employee: [{ id: 0 }] }])(
  'rejects a malformed collection %j',
  (data) => expect(() => QuoteEngineersModel.fromJson(data)).toThrow(),
);
