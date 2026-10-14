<script setup lang="ts">
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import { computed } from 'vue';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import WorkItemsController from '../controllers/work-items.controller';
  import { DataLoading } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  const props = defineProps<{
    modelValue: TitleInterface<string | number> | TitleInterface<string | number>[] | null;
    disabled?: boolean;
    mainOnly?: boolean;
    multiple?: boolean;
    error?: string;
    id: string;
  }>();
  const emit = defineEmits<{
    'update:modelValue': [
      TitleInterface<string | number> | TitleInterface<string | number>[] | null,
    ];
  }>();
  const controller = WorkItemsController.getInstance();
  const options = computed(() =>
    props.mainOnly ? controller.drawingStages.value : controller.stages.value,
  );
  const loading = computed(() => controller.stagesState.value instanceof DataLoading);
</script>
<template>
  <div class="field-group work-items-stage">
    <UpdatedCustomInputSelect
      :id="id"
      :type="multiple ? 2 : 1"
      :model-value="modelValue"
      :label="mainOnly ? 'work_items.main_stages' : 'work_items.stage'"
      :placeholder="$t('work_items.select_stage')"
      :static-options="options"
      :disabled="disabled || loading || !options.length"
      :required="true"
      @update:model-value="emit('update:modelValue', $event)"
    >
      <template #LabelHeader>
        <span class="field-help-label-row">
          <FieldHelpIcon
            :label="$t(mainOnly ? 'work_items.main_stages' : 'work_items.stage')"
            field-name="stage"
            :field-id="id"
            :help-text="$t('field_help.execution_fields.stage')"
          />
        </span> </template
    ></UpdatedCustomInputSelect>
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
    <p v-else-if="!options.length">
      {{ $t(mainOnly ? 'work_items.main_stages_unavailable' : 'work_items.no_stages') }}
    </p>
  </div>
</template>
