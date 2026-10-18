<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import { computed, ref, watch, onBeforeUnmount } from 'vue';
  import Dialog from 'primevue/dialog';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import {
    DataInitial,
    DataLoading,
    DataSuccess,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import type { FieldError } from '@/base/Presentation/Utils/classValidation';
  import { filesToBase64 } from '@/base/Presentation/Utils/file_to_base_64';
  import { attachmentKind } from '@/shared/AttachmentGallery/attachmentGallery';
  import WorkItemStageSelect from './WorkItemStageSelect.vue';
  import WorkItemsController from '../controllers/work-items.controller';
  import StoreShopDrawingQuoteParams from '../../core/params/store.shop-drawing.params';
  const props = defineProps<{ visible: boolean }>();
  const emit = defineEmits<{ 'update:visible': [boolean] }>();
  const controller = WorkItemsController.getInstance();
  const title = ref('');
  const date = ref('');
  const version = ref('');
  const stages = ref<TitleInterface<string | number> | TitleInterface<string | number>[] | null>(
    [],
  );
  const file = ref<string | null>(null);
  const filename = ref('');
  const mimeType = ref('');
  const processing = ref(false);
  const uploadError = ref(false);
  const errors = ref<FieldError[]>([]);
  let uploadEpoch = 0;
  const busy = computed(
    () => processing.value || controller.drawingsSaveState.value instanceof DataLoading,
  );
  const failure = computed(() => controller.drawingsSaveState.value.error?.displayMessage);
  const backendErrors = computed(() =>
    Object.values(controller.drawingsSaveState.value.error?.validationErrors ?? {}).flat(),
  );
  const fileIcon = computed(() => {
    const kind = attachmentKind({ url: '', name: filename.value, mimeType: mimeType.value });
    return kind === 'pdf' ? 'pi pi-file-pdf' : kind === 'image' ? 'pi pi-image' : 'pi pi-file';
  });
  function fieldError(field: string) {
    return errors.value.find((error) => error.field === field)?.message;
  }
  function clearFile() {
    uploadEpoch++;
    file.value = null;
    filename.value = '';
    mimeType.value = '';
    processing.value = false;
    uploadError.value = false;
  }
  watch(
    () => props.visible,
    (visible) => {
      if (!visible) {
        uploadEpoch++;
        processing.value = false;
        return;
      }
      title.value = '';
      date.value = '';
      version.value = '';
      stages.value = [];
      errors.value = [];
      clearFile();
      controller.drawingsSaveState.value = new DataInitial();
    },
    { immediate: true },
  );
  onBeforeUnmount(() => {
    uploadEpoch++;
  });
  async function selectFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const selected = input.files?.[0];
    input.value = '';
    if (!selected || busy.value) return;
    const epoch = ++uploadEpoch;
    processing.value = true;
    uploadError.value = false;
    try {
      const encoded = await filesToBase64(selected);
      if (epoch !== uploadEpoch || Array.isArray(encoded)) return;
      file.value = encoded.file;
      filename.value = encoded.alt;
      mimeType.value = selected.type;
    } catch {
      if (epoch === uploadEpoch) uploadError.value = true;
    } finally {
      if (epoch === uploadEpoch) processing.value = false;
    }
  }
  async function save() {
    if (busy.value) return;
    const params = new StoreShopDrawingQuoteParams({
      quoteId: controller.quoteId.value ?? 0,
      title: title.value,
      date: date.value || null,
      versionNumber: version.value,
      file: file.value,
      projectTimelineStageIds: [
        ...new Set(
          (Array.isArray(stages.value) ? stages.value : []).map((stage) => Number(stage.id)),
        ),
      ],
    });
    errors.value = params.validate().errors;
    if (errors.value.length) return;
    const saved = await controller.saveDrawing(params);
    if (saved instanceof DataSuccess) emit('update:visible', false);
  }
</script>
<template>
  <Dialog
    :visible="visible"
    modal
    class="work-items-dialog workspace-dialog"
    :header="$t('work_items.new_drawing')"
    :closable="!busy"
    :close-on-escape="!busy"
    @update:visible="emit('update:visible', $event)"
  >
    <StandardFormLayout as="form" embedded class="work-items-form" @submit.prevent="save">
      <div class="field-group input-wrapper">
        <span class="field-help-label-row field-help-label-row--block"
          ><label class="field-label label" for="drawing-title"
            >{{ $t('work_items.drawing_title') }} *</label
          >
          <FieldHelpIcon
            :label="$t('work_items.drawing_title')"
            field-name="drawing_title"
            field-id="drawing-title"
            :help-text="$t('field_help.execution_fields.drawing_title')"
          />
        </span>
        <input
          id="drawing-title"
          v-model="title"
          class="input workspace-control"
          type="text"
          required
          :disabled="busy"
          :aria-invalid="!!fieldError('title')"
          aria-describedby="drawing-title-error"
        /><small id="drawing-title-error" role="alert">{{ fieldError('title') }}</small>
      </div>
      <div class="field-group input-wrapper">
        <span class="field-help-label-row field-help-label-row--block"
          ><label class="field-label label" for="drawing-date">{{
            $t('work_items.drawing_date')
          }}</label>
          <FieldHelpIcon
            :label="$t('work_items.drawing_date')"
            field-name="drawing_date"
            field-id="drawing-date"
            :help-text="$t('field_help.execution_fields.drawing_date')"
          />
        </span>
        <input
          id="drawing-date"
          v-model="date"
          class="input workspace-control"
          type="date"
          :disabled="busy"
          :aria-invalid="!!fieldError('date')"
          aria-describedby="drawing-date-error"
        /><small id="drawing-date-error" role="alert">{{ fieldError('date') }}</small>
      </div>
      <div class="field-group input-wrapper">
        <span class="field-help-label-row field-help-label-row--block"
          ><label class="field-label label" for="drawing-version"
            >{{ $t('work_items.version_number') }} *</label
          >
          <FieldHelpIcon
            :label="$t('work_items.version_number')"
            field-name="version_number"
            field-id="drawing-version"
            :help-text="$t('field_help.execution_fields.version_number')"
          />
        </span>
        <input
          id="drawing-version"
          v-model="version"
          class="input workspace-control"
          type="text"
          required
          :disabled="busy"
          :aria-invalid="!!fieldError('versionNumber')"
          aria-describedby="drawing-version-error"
        /><small id="drawing-version-error" role="alert">{{ fieldError('versionNumber') }}</small>
      </div>
      <WorkItemStageSelect
        id="drawing-stages"
        v-model="stages"
        main-only
        multiple
        :disabled="busy"
        :error="fieldError('projectTimelineStageIds')"
      />
      <div class="field-group input-wrapper">
        <span class="field-help-label-row field-help-label-row--block"
          ><label class="field-label label" for="drawing-file">{{
            $t('work_items.drawing_file')
          }}</label>
          <FieldHelpIcon
            :label="$t('work_items.drawing_file')"
            field-name="drawing_file"
            field-id="drawing-file"
            :help-text="$t('field_help.execution_fields.drawing_file')"
          />
        </span>
        <input
          id="drawing-file"
          class="input"
          type="file"
          :disabled="busy"
          aria-describedby="drawing-file-help"
          @change="selectFile"
        /><small id="drawing-file-help" class="work-items-file-help">{{
          $t('work_items.drawing_file_help')
        }}</small>
        <p v-if="processing" role="status">{{ $t('work_items.processing_file') }}</p>
        <p v-if="uploadError" class="work-items-error" role="alert">
          {{ $t('work_items.file_processing_error') }}
        </p>
        <div v-if="filename" class="work-items-file-selection">
          <i :class="fileIcon" aria-hidden="true" /><span>{{ filename }}</span>
          <AppButton type="button" theme="secondary" :disabled="busy" @click="clearFile">{{
            $t('work_items.remove_file')
          }}</AppButton>
        </div>
      </div>
      <p v-if="failure" class="work-items-error" role="alert">{{ $t(failure) }}</p>
      <ul v-if="backendErrors.length" class="work-items-error" role="alert">
        <li v-for="(message, index) in backendErrors" :key="index">{{ message }}</li>
      </ul>
      <div class="work-items-actions">
        <AppButton
          type="button"
          theme="secondary"
          :disabled="busy"
          @click="emit('update:visible', false)"
          >{{ $t('work_items.cancel') }}</AppButton
        ><AppButton
          type="submit"
          :loading="busy"
          :disabled="busy || !controller.drawingStages.value.length"
          >{{ $t('work_items.save_drawing') }}</AppButton
        >
      </div>
    </StandardFormLayout></Dialog
  >
</template>
