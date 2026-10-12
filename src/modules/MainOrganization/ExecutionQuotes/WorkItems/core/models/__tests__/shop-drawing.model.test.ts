import { expect, it } from 'vitest';
import EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';
import ShopDrawingQuoteModel from '../shop-drawing.model';
export const drawingFixture = {
  id: 1,
  employee: { id: 1, name: 'Creator', type: 1 },
  quote_id: 140,
  project_id: 86,
  title: 'MEP',
  date: '2026-10-12',
  version_number: 'V1',
  file: 'https://example.test/drawing.pdf',
  custom_number: 2,
  stages: [{ id: 7, stage: { id: 129, title: 'Main' }, sub_stage: null, created_at: null }],
  created_at: '2026-10-12 11:16:13',
};
it('maps server numbering, nullable values and named nested models', () => {
  const drawing = ShopDrawingQuoteModel.fromJson(drawingFixture);
  expect(drawing.employee).toBeInstanceOf(EmployeeModel);
  expect(drawing.employee?.name).toBe('Creator');
  expect(drawing.quoteId).toBe(140);
  expect(drawing.projectId).toBe(86);
  expect(drawing.customNumber).toBe(2);
  expect(drawing.stages[0]?.projectTimelineStageId).toBe(7);
  expect(drawing.versionNumber).toBe('V1');
  const nullable = ShopDrawingQuoteModel.fromJson({
    ...drawingFixture,
    date: null,
    file: null,
    employee: null,
    custom_number: null,
    project_id: null,
  });
  expect(nullable.date).toBeNull();
  expect(nullable.file).toBeNull();
  expect(nullable.employee).toBeNull();
  expect(() => ShopDrawingQuoteModel.fromJson({ ...drawingFixture, stages: {} })).toThrow();
});
