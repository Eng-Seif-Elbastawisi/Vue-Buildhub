<script setup lang="ts">
  import { computed } from 'vue';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import WorkItemsController from '../controllers/work-items.controller';
  import { DataLoading } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  defineProps<{
    modelValue: TitleInterface<string | number> | TitleInterface<string | number>[] | null;
    disabled?: boolean;
    error?: string;
    id: string;
  }>();
  const emit = defineEmits<{
    'update:modelValue': [
      TitleInterface<string | number> | TitleInterface<string | number>[] | null,
    ];
  }>();
  const controller = WorkItemsController.getInstance();
  const options = computed(() => controller.stages.value);
  const loading = computed(() => controller.stagesState.value instanceof DataLoading);
</script>
<template>
  <div class="work-items-stage">
    <UpdatedCustomInputSelect
      :id="id"
      :model-value="modelValue"
      label="work_items.stage"
      :placeholder="$t('work_items.select_stage')"
      :static-options="options"
      :disabled="disabled || loading || !options.length"
      :required="true"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <small v-if="error" role="alert">{{ error }}</small>
    <p v-if="loading" role="status">{{ $t('work_items.loading_stages') }}</p>
    <div v-else-if="controller.stagesState.value.hasError" role="alert">
      {{ $t('work_items.stages_error') }}
      <button
        type="button"
        class="btn btn-secondary"
        :disabled="disabled"
        @click="controller.loadStages()"
      >
        {{ $t('work_items.retry') }}
      </button>
    </div>
    <p v-else-if="!options.length">{{ $t('work_items.no_stages') }}</p>
  </div>
</template>
