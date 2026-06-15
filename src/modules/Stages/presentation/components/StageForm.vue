<script setup lang="ts">
  import { ref, watch } from 'vue';
  import type StageModel from '../../core/models/stage.model';
  import AddStageParams from '../../core/params/add.stges.params';

  const emit = defineEmits(['updateData']);

  const { stage, loading } = defineProps<{
    stage?: StageModel;
    loading?: boolean;
  }>();

  const title = ref<string>('');

  watch(
    () => stage,
    (newStage) => {
      if (newStage) {
        title.value = newStage.title;
      }
    },
    { immediate: true },
  );

  const updateData = () => {
    const params = new AddStageParams({
      title: title.value,
    });
    emit('updateData', params);
  };
</script>

<template>
  <div class="form-fields">
    <div class="field-group" :class="{ disabled: loading }">
      <label class="field-label" for="title"> Stage Title </label>
      <div class="input-wrap">
        <input
          id="title"
          v-model="title"
          type="text"
          placeholder="Stage Title"
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
