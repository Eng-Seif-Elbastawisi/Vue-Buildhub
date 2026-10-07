import { expect, it } from 'vitest';
import TitleModel from '@/base/Core/Models/titleModel';
import ScheduleSelectionModel from '../schedule.selection.model';
it('retains Stage labels separately from the selected IDs', () => {
  const selection = new ScheduleSelectionModel(
    10,
    [11],
    TitleModel.fromMap({ id: 10, title: 'Parent' }),
    [TitleModel.fromMap({ id: 11, title: 'Child' })],
  );
  expect(selection.quoteStageId).toBe(10);
  expect(selection.children).toEqual([11]);
  expect(selection.childLabels?.[0]?.title).toBe('Child');
});
