import { ref } from 'vue';
import { describe, expect, it } from 'vitest';
import { useStageSubStageFilters } from '../useStageSubStageFilters';

describe('useStageSubStageFilters', () => {
  it('uses only root stages and derives sub-stages from the selected parent', () => {
    const stage = ref<{ id?: number } | null>(null);
    const { stageParams, subStageParams } = useStageSubStageFilters(stage);

    expect(stageParams.toMap()).toMatchObject({ parent_id: null });
    expect(subStageParams.value).toBeUndefined();

    stage.value = { id: 15 };

    expect(subStageParams.value?.toMap()).toMatchObject({ parent_id: 15 });
  });
});
