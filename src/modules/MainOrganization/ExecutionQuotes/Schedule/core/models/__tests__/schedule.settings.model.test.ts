import { expect, it } from 'vitest';
import ScheduleSettingsModel from '../schedule.settings.model';
it('retains missing, null and date-only planned starts separately from no days off', () => {
  for (const start of [undefined, null, '2026-10-09']) {
    const settings = new ScheduleSettingsModel(start, []);
    expect(settings.startDate).toBe(start);
    expect(settings.holidays).toEqual([]);
  }
});

it.each([{ holidays: [] }, { holidays: [4] }, { holidays: [1, 7] }])(
  'maps saved configuration with holidays $holidays',
  ({ holidays }) => {
    const settings = ScheduleSettingsModel.fromJson({
      id: 1,
      start_date: '2026-10-29',
      holidays,
      created_at: '2026-10-11 08:17:42',
    });
    expect(settings.startDate).toBe('2026-10-29');
    expect(settings.holidays).toEqual(holidays);
  },
);
it.each([
  null,
  {},
  { start_date: '2026-10-29' },
  { start_date: '2026-10-29', holidays: ['4'] },
  { start_date: '2026-10-29', holidays: [8] },
])('rejects malformed configuration %j without defaulting saved fields', (configuration) => {
  expect(() => ScheduleSettingsModel.fromJson(configuration)).toThrow('schedule.invalid_response');
});

it('maps the expanded configuration and existing employee mapper without deriving status from dates', () => {
  const configuration = {
    id: 1,
    work_status: 1,
    responsible_employee_id: 9,
    responsible_employee: { id: 9, name: 'Fleur Armstrong', type: 4 },
    start_date: '2026-10-10',
    delivery_date: '2026-12-01',
    site_condition: 'Ready',
    holidays: [5, 6],
    created_at: '2026-10-07 12:40:59',
  };
  const result = ScheduleSettingsModel.fromJson(configuration);
  expect(result).toMatchObject({
    id: 1,
    workStatus: 1,
    responsibleEmployeeId: 9,
    responsibleEmployee: { id: 9, name: 'Fleur Armstrong', employee_type: 4 },
    startDate: '2026-10-10',
    deliveryDate: '2026-12-01',
    siteCondition: 'Ready',
    holidays: [5, 6],
    createdAt: '2026-10-07 12:40:59',
  });
  const unstarted = ScheduleSettingsModel.fromJson({
    ...configuration,
    work_status: null,
    responsible_employee_id: null,
    responsible_employee: null,
    delivery_date: null,
    site_condition: null,
  });
  expect(unstarted).toMatchObject({
    workStatus: null,
    responsibleEmployeeId: null,
    responsibleEmployee: null,
    startDate: '2026-10-10',
    deliveryDate: null,
    siteCondition: null,
  });
  expect(
    ScheduleSettingsModel.fromJson({ ...configuration, start_date: null }).startDate,
  ).toBeNull();
});

it.each([
  { work_status: 0 },
  { work_status: '1' },
  { responsible_employee_id: '9' },
  { responsible_employee: { id: 9, name: 'Fleur' } },
])('rejects malformed expanded fields %j', (fields) => {
  expect(() =>
    ScheduleSettingsModel.fromJson({ start_date: null, holidays: [], ...fields }),
  ).toThrow('schedule.invalid_response');
});
