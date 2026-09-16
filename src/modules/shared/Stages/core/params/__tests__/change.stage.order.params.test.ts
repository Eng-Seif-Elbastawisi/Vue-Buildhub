import { describe, expect, it } from 'vitest';
import ChangeStageOrderParams from '../change.stage.order.params';

describe('ChangeStageOrderParams', () => {
  it('correctly maps properties to payload', () => {
    const params = new ChangeStageOrderParams({
      stageId: 77,
      order: 2,
    });

    expect(params.toMap()).toEqual({
      stage_id: 77,
      order: 2,
    });
  });

  it('validates required fields', () => {
    const validParams = new ChangeStageOrderParams({
      stageId: 77,
      order: 2,
    });
    expect(validParams.validate().isValid).toBe(true);

    const invalidParams = new ChangeStageOrderParams({
      stageId: (undefined as unknown as number),
      order: 2,
    });
    expect(invalidParams.validate().isValid).toBe(false);
  });
});
