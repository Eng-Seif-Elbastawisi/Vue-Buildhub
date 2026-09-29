<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
import AttachmentTypeController from '@/modules/MainOrganization/AttachmentType/presentation/controllers/attachment.type.controller';
import IndexAttachmentTypeParams from '@/modules/MainOrganization/AttachmentType/core/params/index.attachment.type.params';
import type TitleInterface from '@/base/Data/Models/titleInterface';

export interface ProjectAttachmentItem {
  file: string; // base64 or URL
  name?: string;
  size?: number | string;
  typeId?: number;
  typeName?: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: ProjectAttachmentItem[];
    existingFiles?: string[];
    disabled?: boolean;
  }>(),
  {
    modelValue: () => [],
    existingFiles: () => [],
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [items: ProjectAttachmentItem[]];
  change: [items: ProjectAttachmentItem[]];
}>();

const { t } = useI18n();
const attachmentTypeController = AttachmentTypeController.getInstance();
const indexAttachmentTypeParams = new IndexAttachmentTypeParams('', 1, 100, 0);

const selectedType = ref<TitleInterface<number> | null>(null);
const stagedFile = ref<{ file: string; name: string; size: string } | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    stagedFile.value = {
      file: e.target?.result as string,
      name: file.name,
      size: formatFileSize(file.size),
    };
  };
  reader.readAsDataURL(file);
  target.value = '';
};

const addAttachment = () => {
  if (!stagedFile.value) return;

  const newItem: ProjectAttachmentItem = {
    file: stagedFile.value.file,
    name: stagedFile.value.name,
    size: stagedFile.value.size,
    typeId: selectedType.value?.id ? Number(selectedType.value.id) : undefined,
    typeName: selectedType.value?.title ? String(selectedType.value.title) : undefined,
  };

  const updatedList = [...props.modelValue, newItem];
  emit('update:modelValue', updatedList);
  emit('change', updatedList);

  stagedFile.value = null;
  selectedType.value = null;
};

const removeAttachment = (index: number) => {
  const updatedList = props.modelValue.filter((_, i) => i !== index);
  emit('update:modelValue', updatedList);
  emit('change', updatedList);
};

const getFileExtension = (name?: string, fileUrl?: string): string => {
  const source = name || fileUrl || '';
  const match = source.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return match ? match[1].toUpperCase() : 'FILE';
};

const isPdf = (name?: string, fileUrl?: string): boolean => {
  return getFileExtension(name, fileUrl).toLowerCase() === 'pdf';
};

const isImage = (name?: string, fileUrl?: string): boolean => {
  const ext = getFileExtension(name, fileUrl).toLowerCase();
  return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext);
};
</script>

<template>
  <div class="project-attachments-section">
    <div class="section-title">
      <h4>{{ $t('project.attachments_title') }}</h4>
    </div>

    <!-- Upload Controls Card -->
    <div class="attachment-controls-card" :class="{ disabled }">
      <!-- Add Button (+) -->
      <button
        type="button"
        class="add-btn"
        :disabled="!stagedFile || disabled"
        :title="$t('add')"
        @click="addAttachment"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <!-- Upload Trigger Box -->
      <div class="upload-dropzone" :class="{ 'has-file': stagedFile }" @click="triggerFileInput">
        <input
          ref="fileInputRef"
          type="file"
          class="hidden-input"
          @change="handleFileSelect"
        />
        <div class="upload-content">
          <svg
            class="upload-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span class="upload-label">
            {{ stagedFile ? stagedFile.name : $t('project.click_to_upload') }}
          </span>
        </div>
      </div>

      <!-- Attachment Type Dropdown -->
      <div class="attachment-type-select">
        <label class="control-label">
          <span class="required-star">*</span>
          {{ $t('project.attachment_type') }}
        </label>
        <UpdatedCustomInputSelect
          id="project_attachment_type"
          v-model="selectedType"
          :controller="attachmentTypeController"
          :params="indexAttachmentTypeParams"
          :placeholder="$t('project.attachment_type_placeholder')"
        />
      </div>
    </div>

    <!-- Attachments List -->
    <div v-if="modelValue.length > 0" class="attachments-list">
      <div
        v-for="(item, index) in modelValue"
        :key="index"
        class="attachment-card"
      >
        <!-- Remove Button (Left in RTL) -->
        <button
          type="button"
          class="remove-btn"
          :disabled="disabled"
          :title="$t('delete')"
          @click="removeAttachment(index)"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <!-- Attachment Type Badge (Center) -->
        <div v-if="item.typeName" class="type-badge">
          <span>{{ $t('project.attachment_type_label') }}: {{ item.typeName }}</span>
        </div>

        <!-- File Info (Right in RTL) -->
        <div class="file-info">
          <div class="file-text">
            <span class="file-name">{{ item.name || `Attachment ${index + 1}` }}</span>
            <span v-if="item.size" class="file-size">{{ item.size }}</span>
          </div>
          <div class="file-icon-wrapper" :class="{ 'is-pdf': isPdf(item.name, item.file), 'is-img': isImage(item.name, item.file) }">
            <span class="ext-badge">{{ getFileExtension(item.name, item.file) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.project-attachments-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.section-title h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--black-text, #1e293b);
  margin: 0;
}

.attachment-controls-card {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  width: 100%;

  &.disabled {
    pointer-events: none;
    opacity: 0.7;
  }
}

.attachment-type-select {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.control-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-6, #4b5563);
}

.required-star {
  color: var(--danger, #ef4444);
}

.upload-dropzone {
  flex: 1;
  height: 46px;
  border: 1.5px dashed var(--border-weak, #d1d5db);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  cursor: pointer;
  background: var(--white, #ffffff);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--PrimaryColor, #ab6c39);
    background: rgba(171, 108, 57, 0.04);
  }

  &.has-file {
    border-color: var(--PrimaryColor, #ab6c39);
    background: rgba(171, 108, 57, 0.06);
  }
}

.hidden-input {
  display: none;
}

.upload-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-5, #6b7280);
  font-size: 0.875rem;
}

.upload-icon {
  color: var(--gray-5, #6b7280);
}

.add-btn {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: var(--PrimaryColor, #ab6c39);
  color: #ffffff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.attachment-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  border: 1.5px solid var(--PrimaryColor, #ab6c39);
  border-radius: 30px;
  background: var(--white, #ffffff);
  transition: all 0.2s ease;
  gap: 1rem;

  &:hover {
    box-shadow: 0 4px 12px rgba(171, 108, 57, 0.08);
  }
}

.remove-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--border-weak, #d1d5db);
  background: var(--white, #ffffff);
  color: var(--gray-5, #6b7280);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--danger, #ef4444);
    color: var(--danger, #ef4444);
    background: rgba(239, 68, 68, 0.05);
  }
}

.type-badge {
  padding: 0.35rem 1rem;
  border: 1px solid var(--PrimaryColor, #ab6c39);
  border-radius: 20px;
  background: rgba(171, 108, 57, 0.05);
  color: var(--PrimaryColor, #ab6c39);
  font-size: 0.8125rem;
  font-weight: 500;
  white-space: nowrap;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.file-text {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
}

.file-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--black-text, #1e293b);
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 0.75rem;
  color: var(--gray-4, #9ca3af);
}

.file-icon-wrapper {
  width: 32px;
  height: 36px;
  border-radius: 6px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  color: #475569;

  &.is-pdf {
    background: #fee2e2;
    color: #dc2626;
  }

  &.is-img {
    background: #f3e8ff;
    color: #9333ea;
  }
}

.ext-badge {
  font-size: 0.625rem;
  font-weight: 800;
  text-transform: uppercase;
}
</style>
