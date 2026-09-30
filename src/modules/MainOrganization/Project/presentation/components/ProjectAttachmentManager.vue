<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
import AttachmentTypeController from '@/modules/MainOrganization/AttachmentType/presentation/controllers/attachment.type.controller';
import IndexAttachmentTypeParams from '@/modules/MainOrganization/AttachmentType/core/params/index.attachment.type.params';
import type TitleInterface from '@/base/Data/Models/titleInterface';

export interface ProjectAttachmentItem {
  file: string;
  name?: string;
  size?: number | string;
  typeId?: number;
  typeName?: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: ProjectAttachmentItem[];
    disabled?: boolean;
  }>(),
  {
    modelValue: () => [],
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [attachments: ProjectAttachmentItem[]];
  change: [attachments: ProjectAttachmentItem[]];
}>();

const { t } = useI18n();
const attachmentTypeController = AttachmentTypeController.getInstance();
const indexAttachmentTypeParams = new IndexAttachmentTypeParams('', 1, 100, 0);

const selectedType = ref<TitleInterface<number> | null>(null);
const stagedFile = ref<{ file: string; name: string; size: string } | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const canAddAttachment = computed(
  () => Boolean(stagedFile.value && selectedType.value?.id != null) && !props.disabled,
);

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const bytesPerKilobyte = 1024;
  const sizeUnits = ['B', 'KB', 'MB', 'GB'];
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(bytesPerKilobyte));
  return `${parseFloat((bytes / Math.pow(bytesPerKilobyte, unitIndex)).toFixed(1))} ${sizeUnits[unitIndex]}`;
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const stageFile = (file: File) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    stagedFile.value = {
      file: event.target?.result as string,
      name: file.name,
      size: formatFileSize(file.size),
    };
  };
  reader.readAsDataURL(file);
};

const stageSelectedFile = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  stageFile(file);
  target.value = '';
};

const stageDroppedFile = (event: DragEvent) => {
  if (props.disabled) return;

  const file = event.dataTransfer?.files[0];
  if (file) stageFile(file);
};

const addAttachment = () => {
  if (!canAddAttachment.value || !stagedFile.value || selectedType.value?.id == null) return;

  const newAttachment: ProjectAttachmentItem = {
    file: stagedFile.value.file,
    name: stagedFile.value.name,
    size: stagedFile.value.size,
    typeId: Number(selectedType.value.id),
    typeName: selectedType.value?.title ? String(selectedType.value.title) : undefined,
  };

  const updatedAttachments = [...props.modelValue, newAttachment];
  emit('update:modelValue', updatedAttachments);
  emit('change', updatedAttachments);

  stagedFile.value = null;
  selectedType.value = null;
};

const removeAttachment = (index: number) => {
  const updatedAttachments = props.modelValue.filter(
    (_, attachmentIndex) => attachmentIndex !== index,
  );
  emit('update:modelValue', updatedAttachments);
  emit('change', updatedAttachments);
};

const getFileExtension = (fileName?: string, fileUrl?: string): string => {
  const fileSource = fileName || fileUrl || '';
  const extensionMatch = fileSource.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return extensionMatch ? extensionMatch[1].toUpperCase() : 'FILE';
};

const isPdf = (fileName?: string, fileUrl?: string): boolean => {
  return getFileExtension(fileName, fileUrl).toLowerCase() === 'pdf';
};

const isImage = (fileName?: string, fileUrl?: string): boolean => {
  const extension = getFileExtension(fileName, fileUrl).toLowerCase();
  return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(extension);
};

const getAttachmentName = (attachment: ProjectAttachmentItem, index: number): string => {
  return attachment.name || t('project.attachment_fallback', { number: index + 1 });
};
</script>

<template>
  <section class="project-attachments-section" aria-labelledby="project-attachments-title">
    <header class="section-title">
      <span class="section-title__icon" aria-hidden="true">
        <i class="pi pi-paperclip"></i>
      </span>
      <div class="section-title__copy">
        <h4 id="project-attachments-title">{{ $t('project.attachments_title') }}</h4>
        <p>{{ $t('project.attachments_description') }}</p>
      </div>
      <span class="attachment-count" aria-live="polite">
        {{ $t('project.attachments_count', { count: modelValue.length }) }}
      </span>
    </header>

    <div class="attachment-controls-card" :class="{ disabled }">
      <div class="attachment-type-select">
        <label class="control-label">
          <span class="required-star" aria-hidden="true">*</span>
          {{ $t('project.attachment_type') }}
        </label>
        <UpdatedCustomInputSelect id="project_attachment_type" v-model="selectedType"
          :controller="attachmentTypeController" :params="indexAttachmentTypeParams"
          :placeholder="$t('project.attachment_type_placeholder')" />
      </div>

      <div class="file-picker">
        <label class="control-label" for="project_attachment_file">
          {{ $t('project.attachment_file') }}
        </label>
        <input id="project_attachment_file" multiple ref="fileInputRef" type="file" class="hidden-input"
          :disabled="disabled" @change="stageSelectedFile" />
        <button type="button" class="upload-dropzone" :class="{ 'has-file': stagedFile }" :disabled="disabled"
          aria-describedby="project-attachment-upload-hint" @click="triggerFileInput" @dragover.prevent
          @drop.prevent="stageDroppedFile">
          <span class="upload-icon" aria-hidden="true">
            <i :class="stagedFile ? 'pi pi-check' : 'pi pi-upload'"></i>
          </span>
          <span class="upload-copy">
            <strong>{{ stagedFile ? stagedFile.name : $t('project.click_to_upload') }}</strong>
            <small id="project-attachment-upload-hint">
              {{ stagedFile?.size || $t('project.upload_hint') }}
            </small>
          </span>
        </button>
      </div>

      <button type="button" class="add-btn" :disabled="!canAddAttachment" @click="addAttachment">
        <i class="pi pi-plus" aria-hidden="true"></i>
        <span>{{ $t('project.add_attachment') }}</span>
      </button>
    </div>

    <div v-if="modelValue.length > 0" class="attachments-list" aria-live="polite">
      <article v-for="(attachment, index) in modelValue" :key="`${attachment.file}-${index}`" class="attachment-card">
        <div class="file-info">
          <div class="file-icon-wrapper" :class="{
            'is-pdf': isPdf(attachment.name, attachment.file),
            'is-img': isImage(attachment.name, attachment.file),
          }">
            <img v-if="isImage(attachment.name, attachment.file)" :src="attachment.file"
              :alt="getAttachmentName(attachment, index)" />
            <i v-else-if="isPdf(attachment.name, attachment.file)" class="pi pi-file-pdf" aria-hidden="true"></i>
            <span v-else class="ext-badge">
              {{ getFileExtension(attachment.name, attachment.file) }}
            </span>
          </div>
          <div class="file-text">
            <span class="file-name" :title="getAttachmentName(attachment, index)">
              {{ getAttachmentName(attachment, index) }}
            </span>
            <span v-if="attachment.size" class="file-size">{{ attachment.size }}</span>
          </div>
        </div>

        <span v-if="attachment.typeName" class="type-badge">
          {{ $t('project.attachment_type_label') }}: {{ attachment.typeName }}
        </span>

        <button type="button" class="remove-btn" :disabled="disabled"
          :title="$t('project.remove_attachment', { name: getAttachmentName(attachment, index) })" :aria-label="$t('project.remove_attachment', { name: getAttachmentName(attachment, index) })
            " @click="removeAttachment(index)">
          <i class="pi pi-trash" aria-hidden="true"></i>
        </button>
      </article>
    </div>

    <div v-else class="empty-state">
      <span class="empty-state__icon" aria-hidden="true">
        <i class="pi pi-file"></i>
      </span>
      <div>
        <strong>{{ $t('project.no_attachments') }}</strong>
        <p>{{ $t('project.no_attachments_hint') }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.project-attachments-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  padding: 1.25rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-title__icon,
.empty-state__icon {
  display: inline-grid;
  flex: 0 0 auto;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-md);
  place-items: center;
  background: var(--PrimaryColor-light);
  color: var(--PrimaryColor);
}

.section-title__copy {
  min-width: 0;
  flex: 1;
}

.section-title h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gray-900);
}

.section-title p,
.empty-state p {
  margin: 0.25rem 0 0;
  color: var(--gray-500);
  font-size: var(--xs-size);
  line-height: 1.5;
}

.attachment-count {
  flex: 0 0 auto;
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-full);
  background: var(--gray-100);
  color: var(--gray-600);
  font-size: var(--xs-size);
  font-weight: 600;
}

.attachment-controls-card {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr) auto;
  align-items: flex-end;
  gap: 1rem;
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-md);
  background: var(--gray-50);

  &.disabled {
    opacity: 0.7;
  }
}

.attachment-type-select,
.file-picker {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.control-label {
  color: var(--gray-700);
  font-size: var(--sm-size);
  font-weight: 600;
}

.required-star {
  color: var(--danger);
}

.upload-dropzone {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  min-height: 3.25rem;
  padding: 0.55rem 0.75rem;
  border: 1px dashed var(--gray-300);
  border-radius: var(--radius-md);
  text-align: start;
  cursor: pointer;
  background: var(--white);
  color: var(--gray-700);
  transition: var(--transition-fast);

  &:hover:not(:disabled),
  &:focus-visible {
    border-color: var(--PrimaryColor);
    background: var(--PrimaryColor-alpha-4);
    outline: 2px solid var(--PrimaryColor-alpha-20);
    outline-offset: 2px;
  }

  &.has-file {
    border-color: var(--success);
    background: var(--success-light);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
}

.hidden-input {
  display: none;
}

.upload-icon {
  display: inline-grid;
  flex: 0 0 auto;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-sm);
  place-items: center;
  background: var(--PrimaryColor-light);
  color: var(--PrimaryColor);
}

.upload-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.35;

  strong {
    overflow: hidden;
    font-size: var(--sm-size);
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    color: var(--gray-500);
    font-size: var(--xs-size);
  }
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 3.25rem;
  padding: 0.65rem 1rem;
  border: 1px solid var(--PrimaryColor);
  border-radius: var(--radius-md);
  cursor: pointer;
  background: var(--PrimaryColor);
  color: var(--white);
  font-family: 'Medium';
  font-size: var(--sm-size);
  font-weight: 600;
  white-space: nowrap;
  transition: var(--transition-fast);

  &:hover:not(:disabled) {
    border-color: var(--PrimaryColor-hover);
    background: var(--PrimaryColor-hover);
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.attachment-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-md);
  background: var(--white);
  transition: var(--transition-fast);

  &:hover {
    border-color: var(--gray-300);
    box-shadow: var(--shadow-sm);
  }
}

.remove-btn {
  display: inline-grid;
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-sm);
  place-items: center;
  cursor: pointer;
  background: var(--white);
  color: var(--gray-500);
  transition: var(--transition-fast);

  &:hover:not(:disabled),
  &:focus-visible {
    border-color: var(--danger);
    background: var(--danger-light);
    color: var(--danger);
    outline: none;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.type-badge {
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-full);
  background: var(--PrimaryColor-light);
  color: var(--PrimaryColor);
  font-size: var(--xs-size);
  font-weight: 600;
  white-space: nowrap;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.file-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  text-align: start;
}

.file-name {
  max-width: 100%;
  overflow: hidden;
  color: var(--gray-800);
  font-size: var(--sm-size);
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  color: var(--gray-500);
  font-size: var(--xs-size);
}

.file-icon-wrapper {
  display: inline-grid;
  flex: 0 0 auto;
  width: 2.75rem;
  height: 2.75rem;
  overflow: hidden;
  border-radius: var(--radius-sm);
  place-items: center;
  background: var(--gray-100);
  color: var(--gray-600);
  font-size: var(--xs-size);
  font-weight: 700;

  &.is-pdf {
    background: var(--danger-light);
    color: var(--danger);
  }

  &.is-img {
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.ext-badge {
  font-size: 0.625rem;
  font-weight: 800;
  text-transform: uppercase;
}

.empty-state {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px dashed var(--gray-300);
  border-radius: var(--radius-md);
  background: var(--gray-50);

  strong {
    color: var(--gray-700);
    font-size: var(--sm-size);
  }
}

@media (max-width: 900px) {
  .attachment-controls-card {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .add-btn {
    grid-column: span 2;
  }
}

@media (max-width: 640px) {
  .project-attachments-section {
    padding: 1rem;
  }

  .section-title {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .attachment-count {
    margin-inline-start: 3.25rem;
  }

  .attachment-controls-card {
    grid-template-columns: 1fr;
  }

  .add-btn {
    grid-column: auto;
  }

  .attachment-card {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .type-badge {
    grid-column: 1 / -1;
    grid-row: 2;
    width: fit-content;
  }
}
</style>
