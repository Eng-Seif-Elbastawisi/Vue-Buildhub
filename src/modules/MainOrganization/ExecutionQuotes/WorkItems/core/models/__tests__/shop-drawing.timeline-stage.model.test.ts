import { expect, it } from 'vitest';
import TitleModel from '@/base/Core/Models/titleModel';
import ShopDrawingTimelineStageModel from '../shop-drawing.timeline-stage.model';
it('maps timeline association separately from the master stage and preserves null substage', () => {
  const stage = ShopDrawingTimelineStageModel.fromJson({
    id: 7,
    stage: { id: 129, title: 'Electrical' },
    sub_stage: null,
    created_at: null,
  });
  expect(stage.projectTimelineStageId).toBe(7);
  expect(stage.stage).toBeInstanceOf(TitleModel);
  expect(stage.stage?.id).toBe(129);
  expect(stage.subStage).toBeNull();
  expect(() =>
    ShopDrawingTimelineStageModel.fromJson({ id: 7, stage: { id: '129', title: 'Invalid' } }),
  ).toThrow();
});
