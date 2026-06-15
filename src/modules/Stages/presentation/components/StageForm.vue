<script setup lang="ts">
  import { ref, watch } from 'vue';
  import type StageModel from '../../core/models/stage.model';
  import AddStageParams from '../../core/params/add.stges.params';
  import EditStageParams from '../../core/params/edit.stage.params';

  const emit = defineEmits<{
    updateData: [params: AddStageParams | EditStageParams];
  }>();

  const { stage, loading } = defineProps<{
    stage?: StageModel;
    loading?: boolean;
  }>();

  const title = ref<string>('');

  const updateData = () => {
    if (stage?.id) {
      emit('updateData', new EditStageParams(stage.id, title.value));
      return;
    }

    emit(
      'updateData',
      new AddStageParams({
        title: title.value,
      }),
    );
  };

  watch(
    () => stage,
    (newStage) => {
      title.value = newStage?.title ?? '';
      updateData();
    },
    { immediate: true },
  );
</script>

<template>
  <div class="form-fields">
    <div class="field-group" :class="{ disabled: loading }">
      <label class="field-label" for="title"> {{ $t('stage_title') }} </label>
      <div class="input-wrap">
        <input
          id="title"
          v-model="title"
          type="text"
          :placeholder="$t('stage_title')"
          class="field-input"
          @input="updateData"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .form-fields {
    padding: 20px;
    .field-group {
      &.disabled {
        cursor: not-allowed;
        pointer-events: none;
        opacity: 0.7;
      }
    }
  }
</style>
