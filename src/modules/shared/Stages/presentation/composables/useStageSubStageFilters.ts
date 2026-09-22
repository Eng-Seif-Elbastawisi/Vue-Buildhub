import { computed, type Ref } from 'vue';
import IndexStageParams from '../../core/params/index.stage.params';

interface StageSelection {
  id?: string | number;
}

export const useStageSubStageFilters = (stage: Ref<StageSelection | null>) => {
  const stageParams = new IndexStageParams({ perPage: 100, withPage: 0, parentId: null });

  const subStageParams = computed(() => {
    const parentId = Number(stage.value?.id);

    if (!Number.isInteger(parentId) || parentId <= 0) {
      return undefined;
    }

    return new IndexStageParams({ perPage: 20, withPage: 1, parentId });
  });

  return { stageParams, subStageParams };
};
