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
  import StoreReportParams from '../../core/params/store.report.params';
  import { SiteSafetyStatus } from '../../core/constants/work-items.constants';

  const props = defineProps<{ visible: boolean }>();
  const emit = defineEmits<{ 'update:visible': [boolean] }>();
  const { t } = useI18n();
  const controller = WorkItemsController.getInstance();
  type Selection = TitleInterface<string | number> | TitleInterface<string | number>[] | null;
  const stage = ref<Selection>(null);
  const errors = ref<FieldError[]>([]);
  const busy = computed(() => controller.reportsSaveState.value instanceof DataLoading);
  const failure = computed(() => controller.reportsSaveState.value.error?.displayMessage);
  function fieldError(field: string) {
    return errors.value.find((error) => error.field === field)?.message;
  }
  function selectionId(selection: Selection) {
    return selection && !Array.isArray(selection) ? Number(selection.id) : null;
  }
  const date = ref('');
  const notes = ref('');
  const safety = ref<Selection>(null);
  const safetyOptions = computed(() =>
    [1, 2, 3].map((id) => new TitleInterface({ id, title: t(`work_items.safety_${id}`) })),
  );
  watch(
    () => props.visible,
    (visible) => {
      if (!visible) return;
      stage.value = null;
      errors.value = [];
      date.value = '';
      notes.value = '';
      safety.value = new TitleInterface({
        id: SiteSafetyStatus.OK,
        title: t('work_items.safety_1'),
      });
      controller.reportsSaveState.value = new DataInitial();
    },
    { immediate: true },
  );
  async function save() {
    if (busy.value) return;
    const params = new StoreReportParams(
      selectionId(stage.value) ?? 0,
      date.value,
      notes.value.trim() || null,
      selectionId(safety.value) as SiteSafetyStatus,
    );
    errors.value = params.validate().errors;
    if (errors.value.length) return;
    const saved = await controller.saveReport(params);
    if (saved instanceof DataSuccess) emit('update:visible', false);
  }
</script>
<template>
  <Dialog
    :visible="visible"
    modal
    class="work-items-dialog workspace-dialog"
    :header="$t('work_items.daily_report')"
    :closable="!busy"
    :close-on-escape="!busy"
    @update:visible="emit('update:visible', $event)"
  >
    <StandardFormLayout as="form" embedded class="work-items-form" @submit.prevent="save">
      <WorkItemStageSelect
        id="report-stage"
        v-model="stage"
        :disabled="busy"
        :error="fieldError('projectTimelineStageId')"
      />
      <div class="field-group input-wrapper">
        <span class="field-help-label-row field-help-label-row--block"
          ><label for="report-date" class="field-label label">{{
            $t('work_items.report_date')
          }}</label>
          <FieldHelpIcon
            :label="$t('work_items.report_date')"
            field-name="report_date"
            field-id="report-date"
            :help-text="$t('field_help.execution_fields.report_date')"
          />
        </span>
        <input
          id="report-date"
          v-model="date"
          class="input workspace-control"
          type="date"
          :disabled="busy"
          :required="true"
          :aria-invalid="!!fieldError('date')"
          aria-describedby="report-date-error"
        /><small id="report-date-error" role="alert">{{ fieldError('date') }}</small>
      </div>
      <div class="field-group input-wrapper">
        <span class="field-help-label-row field-help-label-row--block"
          ><label for="report-notes" class="field-label label">{{ $t('work_items.notes') }}</label>
          <FieldHelpIcon
            :label="$t('work_items.notes')"
            field-name="notes"
            field-id="report-notes"
            :help-text="$t('field_help.execution_fields.notes')"
          />
        </span>
        <textarea
          id="report-notes"
          v-model="notes"
          class="input workspace-control"
          rows="4"
          :disabled="busy"
        ></textarea>
      </div>
      <div class="field-group">
        <UpdatedCustomInputSelect
          id="report-safety"
          v-model="safety"
          label="work_items.safety"
          :placeholder="$t('work_items.safety')"
          :static-options="safetyOptions"
          :disabled="busy"
          required
        >
          <template #LabelHeader>
            <span class="field-help-label-row">
              <FieldHelpIcon
                :label="$t('work_items.safety')"
                field-name="safety"
                field-id="report-safety"
                :help-text="$t('field_help.execution_fields.safety')"
              />
            </span> </template
        ></UpdatedCustomInputSelect>
      </div>
      <small v-if="fieldError('siteSafetyStatus')" role="alert">{{
        fieldError('siteSafetyStatus')
      }}</small>
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
