<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import { computed, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import Dialog from 'primevue/dialog';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import {
    DataInitial,
    DataLoading,
    DataSuccess,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import type { FieldError } from '@/base/Presentation/Utils/classValidation';
  import WorkItemStageSelect from './WorkItemStageSelect.vue';
  import WorkItemsController from '../controllers/work-items.controller';
  import StoreActivityParams from '../../core/params/store.activity.params';
  import IndexEmployeeParams from '@/modules/MainOrganization/employee/core/params/index.employee.params';
  import { WorkActivityType } from '../../core/constants/work-items.constants';

  const props = defineProps<{ visible: boolean; initialType?: WorkActivityType }>();
  const emit = defineEmits<{ 'update:visible': [boolean] }>();
  const { t } = useI18n();
  const controller = WorkItemsController.getInstance();
  type Selection = TitleInterface<string | number> | TitleInterface<string | number>[] | null;
  const stage = ref<Selection>(null);
  const errors = ref<FieldError[]>([]);
  const busy = computed(() => controller.activitiesSaveState.value instanceof DataLoading);
  const failure = computed(() => controller.activitiesSaveState.value.error?.displayMessage);
  function fieldError(field: string) {
    return errors.value.find((error) => error.field === field)?.message;
  }
  function selectionId(selection: Selection) {
    return selection && !Array.isArray(selection) ? Number(selection.id) : null;
  }
  const title = ref('');
  const employee = ref<Selection>(null);
  const employeeParams = new IndexEmployeeParams('', 1, 10, 1);
  const type = ref<Selection>(null);
  const date = ref('');
  const description = ref('');
  const typeOptions = computed(() =>
    [1, 2, 3, 4].map((id) => new TitleInterface({ id, title: t(`work_items.type_${id}`) })),
  );
  const isMeeting = computed(() => selectionId(type.value) === WorkActivityType.Meeting);
  watch(
    () => props.visible,
    (visible) => {
      if (!visible) return;
      stage.value = null;
      errors.value = [];
      title.value = '';
      employee.value = null;
      date.value = '';
      description.value = '';
      type.value =
        typeOptions.value.find(
          (option) => option.id === (props.initialType ?? WorkActivityType.Meeting),
        ) ?? null;
      controller.activitiesSaveState.value = new DataInitial();
    },
    { immediate: true },
  );
  async function save() {
    if (busy.value) return;
    const params = new StoreActivityParams({
      projectTimelineStageId: selectionId(stage.value) ?? 0,
      type: selectionId(type.value) as WorkActivityType,
      title: title.value,
      date: date.value || null,
      description: description.value.trim() || null,
      employeeId: selectionId(employee.value),
    });
    errors.value = params.validate().errors;
    if (errors.value.length) return;
    const saved = await controller.saveActivity(params);
    if (saved instanceof DataSuccess) emit('update:visible', false);
  }
</script>
<template>
  <Dialog
    :visible="visible"
    modal
    class="work-items-dialog workspace-dialog"
    :header="$t('work_items.new_activity')"
    :closable="!busy"
    :close-on-escape="!busy"
    @update:visible="emit('update:visible', $event)"
  >
    <StandardFormLayout as="form" embedded class="work-items-form" @submit.prevent="save">
      <WorkItemStageSelect
        id="activity-stage"
        v-model="stage"
        :disabled="busy"
        :error="fieldError('projectTimelineStageId')"
      />
      <div class="field-group">
        <UpdatedCustomInputSelect
          id="activity-type"
          v-model="type"
          label="work_items.type"
          :placeholder="$t('work_items.type')"
          :static-options="typeOptions"
          :disabled="busy"
          required
        >
          <template #LabelHeader>
            <span class="field-help-label-row">
              <FieldHelpIcon
                :label="$t('work_items.type')"
                field-name="type"
                field-id="activity-type"
                :help-text="$t('field_help.execution_fields.type')"
              />
            </span> </template
        ></UpdatedCustomInputSelect>
      </div>
      <small v-if="fieldError('type')" role="alert">{{ fieldError('type') }}</small>
      <div class="field-group input-wrapper">
        <span class="field-help-label-row field-help-label-row--block"
          ><label for="activity-title" class="field-label label">{{
            $t('work_items.record_title')
          }}</label>
          <FieldHelpIcon
            :label="$t('work_items.record_title')"
            field-name="record_title"
            field-id="activity-title"
            :help-text="$t('field_help.execution_fields.record_title')"
          />
        </span>
        <input
          id="activity-title"
          v-model="title"
          class="input workspace-control"
          type="text"
          :disabled="busy"
          :required="true"
          :aria-invalid="!!fieldError('title')"
          aria-describedby="activity-title-error"
        /><small id="activity-title-error" role="alert">{{ fieldError('title') }}</small>
      </div>
      <div v-if="isMeeting" class="field-group input-wrapper">
        <span class="field-help-label-row field-help-label-row--block"
          ><label for="activity-date" class="field-label label">{{
            $t('work_items.meeting_date')
          }}</label>
          <FieldHelpIcon
            :label="$t('work_items.meeting_date')"
            field-name="meeting_date"
            field-id="activity-date"
            :help-text="$t('field_help.execution_fields.meeting_date')"
          />
        </span>
        <input
          id="activity-date"
          v-model="date"
          class="input workspace-control"
          type="date"
          :disabled="busy"
          :required="true"
          :aria-invalid="!!fieldError('date')"
          aria-describedby="activity-date-error"
        /><small id="activity-date-error" role="alert">{{ fieldError('date') }}</small>
      </div>
      <div v-else class="field-group input-wrapper">
        <span class="field-help-label-row field-help-label-row--block"
          ><label for="activity-description" class="field-label label">{{
            $t('work_items.record_description')
          }}</label>
          <FieldHelpIcon
            :label="$t('work_items.record_description')"
            field-name="record_description"
            field-id="activity-description"
            :help-text="$t('field_help.execution_fields.record_description')"
          />
        </span>
        <textarea
          id="activity-description"
          v-model="description"
          class="input workspace-control"
          rows="4"
          :disabled="busy"
        ></textarea>
      </div>
      <div v-if="!isMeeting">
        <div class="field-group">
          <UpdatedCustomInputSelect
            id="activity-employee"
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
                  field-id="activity-employee"
                  :help-text="$t('field_help.execution_fields.assigned_employee')"
                />
              </span> </template
          ></UpdatedCustomInputSelect>
        </div>
        <small v-if="fieldError('employeeId')" role="alert">{{ fieldError('employeeId') }}</small>
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
    </StandardFormLayout></Dialog
  >
</template>
