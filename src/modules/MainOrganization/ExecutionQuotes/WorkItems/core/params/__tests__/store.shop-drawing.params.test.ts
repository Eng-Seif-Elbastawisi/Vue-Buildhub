import { expect, it } from 'vitest';
import StoreShopDrawingQuoteParams from '../store.shop-drawing.params';
const fields = {
  quoteId: 140,
  title: ' MEP ',
  date: null,
  versionNumber: ' V1 ',
  file: null,
  projectTimelineStageIds: [7, 17],
};
it('serializes exact backend keys, primitive IDs and explicit nullable values', () => {
  const params = new StoreShopDrawingQuoteParams(fields);
  expect(params.validate().isValid).toBe(true);
  expect(params.toMap()).toEqual({
    quote_id: 140,
    title: 'MEP',
    date: null,
    version_number: 'V1',
    file: null,
    project_timeline_stage_ids: [7, 17],
  });
  const uploaded = new StoreShopDrawingQuoteParams({
    ...fields,
    date: '2026-10-12',
    file: 'data:image/jpeg;base64,YQ==',
  });
  expect(uploaded.toMap().file).toBe('data:image/jpeg;base64,YQ==');
  expect(uploaded.toMap().date).toBe('2026-10-12');
});
it.each([
  { quoteId: 0 },
  { title: ' ' },
  { versionNumber: '' },
  { date: '2026-02-30' },
  { projectTimelineStageIds: [] },
  { projectTimelineStageIds: [7, 7] },
  { projectTimelineStageIds: [7, -1] },
])('rejects invalid drawing fields %j', (patch) => {
  expect(new StoreShopDrawingQuoteParams({ ...fields, ...patch }).validate().isValid).toBe(false);
});
