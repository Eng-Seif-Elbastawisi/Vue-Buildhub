<script setup lang="ts">
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import { computed, ref, watch } from 'vue';
  import Dialog from 'primevue/dialog';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import {
    DataInitial,
    DataLoading,
    DataSuccess,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import type { FieldError } from '@/base/Presentation/Utils/classValidation';
  import WorkItemStageSelect from './WorkItemStageSelect.vue';
  import WorkItemsController from '../controllers/work-items.controller';
  import StoreTaskParams from '../../core/params/store.task.params';
  import IndexEmployeeParams from '@/modules/MainOrganization/employee/core/params/index.employee.params';

  const props = defineProps<{ visible: boolean }>();
  const emit = defineEmits<{ 'update:visible': [boolean] }>();
  const controller = WorkItemsController.getInstance();
  type Selection = TitleInterface<string | number> | TitleInterface<string | number>[] | null;
  const stage = ref<Selection>(null);
  const errors = ref<FieldError[]>([]);
  const busy = computed(() => controller.tasksSaveState.value instanceof DataLoading);
  const failure = computed(() => controller.tasksSaveState.value.error?.displayMessage);
  function fieldError(field: string) {
    return errors.value.find((error) => error.field === field)?.message;
  }
  function selectionId(selection: Selection) {
    return selection && !Array.isArray(selection) ? Number(selection.id) : null;
  }
  const title = ref('');
  const employee = ref<Selection>(null);
  const employeeParams = new IndexEmployeeParams('', 1, 10, 1);
  const endDate = ref('');
  watch(
    () => props.visible,
    (visible) => {
      if (!visible) return;
      stage.value = null;
      errors.value = [];
      title.value = '';
      employee.value = null;
      endDate.value = '';
      controller.tasksSaveState.value = new DataInitial();
    },
    { immediate: true },
  );
  async function save() {
    if (busy.value) return;
    const params = new StoreTaskParams(
      selectionId(stage.value) ?? 0,
      title.value,
      selectionId(employee.value),
      endDate.value || null,
    );
    errors.value = params.validate().errors;
    if (errors.value.length) return;
    const saved = await controller.saveTask(params);
    if (saved instanceof DataSuccess) emit('update:visible', false);
  }
</script>
<template>
  <Dialog
    :visible="visible"
    modal
    class="work-items-dialog"
    :header="$t('work_items.new_task')"
    :closable="!busy"
    :close-on-escape="!busy"
    @update:visible="emit('update:visible', $event)"
  >
    <form class="work-items-form" @submit.prevent="save">
      <WorkItemStageSelect
        id="task-stage"
        v-model="stage"
        :disabled="busy"
        :error="fieldError('projectTimelineStageId')"
      />
      <div class="field-group input-wrapper">
        <span class="field-help-label-row field-help-label-row--block"
          ><label for="task-title" class="field-label label">{{
            $t('work_items.task_title')
          }}</label>
          <FieldHelpIcon
            :label="$t('work_items.task_title')"
            field-name="task_title"
            field-id="task-title"
            :help-text="$t('field_help.execution_fields.task_title')"
          />
        </span>
        <input
          id="task-title"
          v-model="title"
          class="input"
          type="text"
          :disabled="busy"
          :required="true"
          :aria-invalid="!!fieldError('title')"
          aria-describedby="task-title-error"
        /><small id="task-title-error" role="alert">{{ fieldError('title') }}</small>
      </div>
      <div>
        <div class="field-group">
          <UpdatedCustomInputSelect
            id="task-employee"
            v-model="employee"
            label="work_items.assigned_employee"
            :placeholder="$t('work_items.select_employee')"
            :controller="controller.employeeOptions"
            :params="employeeParams"
            paginated
            optional
            :disabled="busy"
          >
            <template #LabelHeader>
              <span class="field-help-label-row">
                <FieldHelpIcon
                  :label="$t('work_items.assigned_employee')"
                  field-name="assigned_employee"
                  field-id="task-employee"
                  :help-text="$t('field_help.execution_fields.assigned_employee')"
                />
              </span> </template
          ></UpdatedCustomInputSelect>
        </div>
        <small v-if="fieldError('employeeId')" role="alert">{{ fieldError('employeeId') }}</small>
      </div>
      <div class="field-group input-wrapper">
        <span class="field-help-label-row field-help-label-row--block"
          ><label for="task-endDate" class="field-label label">{{
            $t('work_items.end_date')
          }}</label>
          <FieldHelpIcon
            :label="$t('work_items.end_date')"
            field-name="end_date"
            field-id="task-endDate"
            :help-text="$t('field_help.execution_fields.end_date')"
          />
        </span>
        <input
          id="task-endDate"
          v-model="endDate"
          class="input"
          type="date"
          :disabled="busy"
          :aria-invalid="!!fieldError('endDate')"
          aria-describedby="task-endDate-error"
        /><small id="task-endDate-error" role="alert">{{ fieldError('endDate') }}</small>
      </div>
      <p v-if="failure" class="work-items-error" role="alert">{{ $t(failure) }}</p>
      <div class="work-items-actions">
        <AppButton
          type="button"
          theme="secondary"
          :disabled="busy"
          @click="emit('update:visible', false)"
          >{{ $t('work_items.cancel') }}</AppButton
        ><AppButton type="submit" :loading="busy" :disabled="!controller.stages.value.length">{{
          $t('work_items.save')
        }}</AppButton>
      </div>
    </form></Dialog
  >
</template>
