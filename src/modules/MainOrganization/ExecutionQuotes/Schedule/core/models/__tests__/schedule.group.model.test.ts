import { expect, it } from 'vitest';
import ScheduleGroupModel from '../schedule.group.model';
it('does not turn nullable or omitted calculation dates into synthetic dates', () => {
  const group = new ScheduleGroupModel({
    id: 201,
    title: 'First Fix',
    stages: [],
    duration: 6,
    durationType: 1,
    startDate: null,
  });
  expect(group.startDate).toBeNull();
  expect(group.finishDate).toBeUndefined();
});
