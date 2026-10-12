import { expect, it } from 'vitest';
import UpdateProjectSiteInfoParams from '../update.project.site-info.params';
it('keeps date-only transport values', () => {
  const params = new UpdateProjectSiteInfoParams(140, '2026-12-01', 'Ready');
  expect(params.validate().isValid).toBe(true);
  expect(params.toMap()).toEqual({
    quote_id: 140,
    delivery_date: '2026-12-01',
    site_condition: 'Ready',
  });
});
it.each(['2026-02-30', '2026-13-01', '2026-12-01T00:00:00Z', ''])(
  'rejects invalid date %s',
  (date) =>
    expect(new UpdateProjectSiteInfoParams(140, date, 'Ready').validate().isValid).toBe(false),
);
