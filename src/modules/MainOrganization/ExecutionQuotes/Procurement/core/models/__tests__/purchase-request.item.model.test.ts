import { expect, it } from 'vitest';
import TitleModel from '@/base/Core/Models/titleModel';
import ShopDrawingTimelineStageModel from '../../../../WorkItems/core/models/shop-drawing.timeline-stage.model';
import PurchaseRequestItemModel from '../purchase-request.item.model';
import { requestRecord } from '../../../__tests__/fixtures';
it.each(['material', 'product'])(
  'maps %s titles, timeline association IDs and decimal strings',
  (type) => {
    const item = PurchaseRequestItemModel.fromJson({
      ...requestRecord().items[0],
      itemable_type: type,
    });
    expect(item.projectTimelineStage).toBeInstanceOf(ShopDrawingTimelineStageModel);
    expect(item.projectTimelineStageId).toBe(17);
    expect(item.projectTimelineStage?.stage?.id).toBe(129);
    expect(item.itemable).toBeInstanceOf(TitleModel);
    expect(item.itemable?.title).toBe('Material Title');
    expect(item.quantity).toBe('10.00');
  },
);
it('does not invent names or quantities when optional item data is missing', () => {
  const item = PurchaseRequestItemModel.fromJson({
    ...requestRecord().items[0],
    itemable: null,
    quantity: null,
    project_timeline_stage: null,
  });
  expect(item.itemable).toBeNull();
  expect(item.quantity).toBeNull();
  expect(item.projectTimelineStage).toBeNull();
});
it('rejects a numeric response quantity and a mismatched timeline relation', () => {
  expect(() =>
    PurchaseRequestItemModel.fromJson({ ...requestRecord().items[0], quantity: 10 }),
  ).toThrow();
  expect(() =>
    PurchaseRequestItemModel.fromJson({
      ...requestRecord().items[0],
      project_timeline_stage_id: 129,
    }),
  ).toThrow();
});
