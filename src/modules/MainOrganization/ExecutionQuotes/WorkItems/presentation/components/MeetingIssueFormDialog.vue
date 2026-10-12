<script setup lang="ts">
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
    class="work-items-dialog"
    :header="$t('work_items.new_activity')"
    :closable="!busy"
    :close-on-escape="!busy"
    @update:visible="emit('update:visible', $event)"
  >
    <form class="work-items-form" @submit.prevent="save">
      <WorkItemStageSelect
        id="activity-stage"
        v-model="stage"
        :disabled="busy"
        :error="fieldError('projectTimelineStageId')"
      />
      <UpdatedCustomInputSelect
        id="activity-type"
        v-model="type"
        label="work_items.type"
        :placeholder="$t('work_items.type')"
        :static-options="typeOptions"
        :disabled="busy"
        required
      /><small v-if="fieldError('type')" role="alert">{{ fieldError('type') }}</small>
      <div class="input-wrapper">
        <label for="activity-title" class="label">{{ $t('work_items.record_title') }}</label
        ><input
          id="activity-title"
          v-model="title"
          class="input"
          type="text"
          :disabled="busy"
          :required="true"
          :aria-invalid="!!fieldError('title')"
          aria-describedby="activity-title-error"
        /><small id="activity-title-error" role="alert">{{ fieldError('title') }}</small>
      </div>
      <div v-if="isMeeting" class="input-wrapper">
        <label for="activity-date" class="label">{{ $t('work_items.meeting_date') }}</label
        ><input
          id="activity-date"
          v-model="date"
          class="input"
          type="date"
          :disabled="busy"
          :required="true"
          :aria-invalid="!!fieldError('date')"
          aria-describedby="activity-date-error"
        /><small id="activity-date-error" role="alert">{{ fieldError('date') }}</small>
      </div>
      <div v-else class="input-wrapper">
        <label for="activity-description" class="label">{{
          $t('work_items.record_description')
        }}</label
        ><textarea
          id="activity-description"
          v-model="description"
          class="input"
          rows="4"
          :disabled="busy"
        ></textarea>
      </div>
      <div v-if="!isMeeting">
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
        /><small v-if="fieldError('employeeId')" role="alert">{{ fieldError('employeeId') }}</small>
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
