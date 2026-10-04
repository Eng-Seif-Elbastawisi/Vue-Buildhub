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
    alt?: string | null;
    link?: string | null;
  }

  interface StagedFile {
    id: string;
    file: string;
    name: string;
    size: string;
    mimeType: string;
    rawFile: File;
  }

  interface GroupedAttachmentItem {
    attachment: ProjectAttachmentItem;
    index: number;
  }

  interface AttachmentGroup {
    key: string;
    typeName: string;
    items: GroupedAttachmentItem[];
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

  const stagedFiles = ref<StagedFile[]>([]);
  const fileReadError = ref(false);

  const fileInputRef = ref<HTMLInputElement | null>(null);

  const canAddAttachments = computed(
    () => stagedFiles.value.length > 0 && selectedType.value?.id != null && !props.disabled,
  );

  const attachmentGroups = computed<AttachmentGroup[]>(() => {
    const groups = new Map<string, AttachmentGroup>();

    props.modelValue.forEach((attachment, index) => {
      const key = attachment.typeId ? String(attachment.typeId) : `untyped-${index}`;
      const existingGroup = groups.get(key);

      if (existingGroup) {
        existingGroup.items.push({ attachment, index });
        return;
      }

      groups.set(key, {
        key,
        typeName: attachment.typeName || t('project.attachment_type_unknown'),
        items: [{ attachment, index }],
      });
    });

    return Array.from(groups.values());
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${parseFloat((bytes / Math.pow(1024, index)).toFixed(1))} ${units[index]}`;
  };

  const getFileExtension = (fileName?: string, fileUrl?: string): string => {
    const source = fileName || fileUrl || '';

    const match = source.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);

    return match ? match[1].toUpperCase() : 'FILE';
  };

  const isPdf = (fileName?: string, fileUrl?: string): boolean => {
    return getFileExtension(fileName, fileUrl).toLowerCase() === 'pdf';
  };

  const isImage = (fileName?: string, fileUrl?: string): boolean => {
    const extension = getFileExtension(fileName, fileUrl).toLowerCase();

    return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(extension);
  };

  const getAttachmentName = (attachment: ProjectAttachmentItem, index: number): string => {
    return (
      attachment.name ||
      t('project.attachment_fallback', {
        number: index + 1,
      })
    );
  };

  const createStagedFile = (file: File): Promise<StagedFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        resolve({
          id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
          file: event.target?.result as string,
          name: file.name,
          size: formatFileSize(file.size),
          mimeType: file.type,
          rawFile: file,
        });
      };

      reader.onerror = () => {
        reject(
          reader.error ?? new DOMException('Unable to read the selected file', 'NotReadableError'),
        );
      };

      reader.readAsDataURL(file);
    });
  };

  const stageFiles = async (files: File[]) => {
    if (props.disabled || !files.length) return;

    try {
      const newFiles = await Promise.all(files.map(createStagedFile));

      stagedFiles.value.push(...newFiles);
      fileReadError.value = false;
    } catch (error) {
      if (!(error instanceof DOMException)) throw error;

      fileReadError.value = true;
    }
  };

  const stageSelectedFiles = async (event: Event) => {
    const target = event.target as HTMLInputElement;

    if (!target.files?.length) return;

    const files = Array.from(target.files);

    await stageFiles(files);

    target.value = '';
  };

  const stageDroppedFiles = async (event: DragEvent) => {
    if (props.disabled) return;

    const files = event.dataTransfer?.files;

    if (!files?.length) return;

    await stageFiles(Array.from(files));
  };

  const removeStagedFile = (id: string) => {
    stagedFiles.value = stagedFiles.value.filter((file) => file.id !== id);
  };

  const clearStagedFiles = () => {
    stagedFiles.value = [];
  };

  const triggerFileInput = () => {
    if (props.disabled) return;

    fileInputRef.value?.click();
  };

  const addAttachments = () => {
    if (!canAddAttachments.value || selectedType.value?.id == null) {
      return;
    }

    const typeId = Number(selectedType.value.id);

    const typeName = selectedType.value.title ? String(selectedType.value.title) : undefined;

    const newAttachments: ProjectAttachmentItem[] = stagedFiles.value.map((file) => ({
      file: file.file,
      name: file.name,
      size: file.size,
      typeId,
      typeName,
      alt: file.name,
      link: null,
    }));

    const updatedAttachments = [...props.modelValue, ...newAttachments];

    emit('update:modelValue', updatedAttachments);

    emit('change', updatedAttachments);

    clearStagedFiles();
    selectedType.value = null;
  };

  const removeAttachment = (index: number) => {
    const updatedAttachments = props.modelValue.filter(
      (_, attachmentIndex) => attachmentIndex !== index,
    );

    emit('update:modelValue', updatedAttachments);

    emit('change', updatedAttachments);
  };

  const updateAttachmentAlt = (index: number, event: Event) => {
    const alt = (event.target as HTMLInputElement).value;
    const updatedAttachments = props.modelValue.map((attachment, attachmentIndex) =>
      attachmentIndex === index ? { ...attachment, alt } : attachment,
    );

    emit('update:modelValue', updatedAttachments);
    emit('change', updatedAttachments);
  };
</script>

<template>
  <section class="project-attachments-section" aria-labelledby="project-attachments-title">
    <!-- Header -->
    <header class="section-title">
      <span class="section-title__icon" aria-hidden="true">
        <i class="pi pi-paperclip"></i>
      </span>

      <div class="section-title__copy">
        <h4 id="project-attachments-title">
          {{ $t('project.attachments_title') }}
        </h4>

        <p>
          {{ $t('project.attachments_description') }}
        </p>
      </div>

      <span class="attachment-count" aria-live="polite">
        {{ modelValue.length }}
      </span>
    </header>

    <!-- Controls -->
    <div class="attachment-controls-card" :class="{ disabled }">
      <!-- Type -->
      <div class="attachment-type-select">
        <label class="control-label">
          <span class="required-star" aria-hidden="true"> * </span>

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

      <!-- File picker -->
      <div class="file-picker">
        <label class="control-label" for="project_attachment_file">
          {{ $t('project.attachment_file') }}
        </label>

        <input
          id="project_attachment_file"
          ref="fileInputRef"
          type="file"
          class="hidden-input"
          multiple
          :disabled="disabled"
          @change="stageSelectedFiles"
        />

        <button
          type="button"
          class="upload-dropzone"
          :class="{
            'has-files': stagedFiles.length > 0,
          }"
          :disabled="disabled"
          @click="triggerFileInput"
          @dragover.prevent
          @drop.prevent="stageDroppedFiles"
        >
          <span class="upload-icon" aria-hidden="true">
            <i :class="stagedFiles.length ? 'pi pi-check' : 'pi pi-cloud-upload'"></i>
          </span>

          <span class="upload-copy">
            <strong>
              {{
                stagedFiles.length
                  ? `${stagedFiles.length} file${stagedFiles.length > 1 ? 's' : ''} selected`
                  : $t('project.click_to_upload')
              }}
            </strong>

            <small>
              {{ $t('project.upload_hint') }}
            </small>
          </span>

          <span class="upload-action" aria-hidden="true">
            <i class="pi pi-plus"></i>
          </span>
        </button>
      </div>

      <!-- Add -->
      <button type="button" class="add-btn" :disabled="!canAddAttachments" @click="addAttachments">
        <i class="pi pi-plus" aria-hidden="true"></i>

        <span>
          {{ $t('project.add_attachment') }}
        </span>

        <span v-if="stagedFiles.length" class="add-count">
          {{ stagedFiles.length }}
        </span>
      </button>
    </div>

    <p v-if="fileReadError" class="file-read-error" role="alert">
      {{ $t('project.file_read_error') }}
    </p>

    <!-- Preview staged files -->
    <div v-if="stagedFiles.length" class="staged-section">
      <div class="staged-header">
        <div>
          <strong>
            {{ $t('project.selected_files') }}
          </strong>

          <span>
            {{ stagedFiles.length }}
            {{ $t('project.files_ready') }}
          </span>
        </div>

        <button type="button" class="clear-btn" :disabled="disabled" @click="clearStagedFiles">
          <i class="pi pi-times"></i>
          {{ $t('delete') }}
        </button>
      </div>

      <div class="staged-files">
        <article v-for="file in stagedFiles" :key="file.id" class="staged-file-card">
          <div class="staged-preview">
            <img v-if="isImage(file.name, file.file)" :src="file.file" :alt="file.name" />

            <div v-else-if="isPdf(file.name)" class="preview-icon pdf">
              <i class="pi pi-file-pdf"></i>
            </div>

            <div v-else class="preview-icon">
              {{ getFileExtension(file.name) }}
            </div>
          </div>

          <div class="staged-file-info">
            <strong :title="file.name">
              {{ file.name }}
            </strong>

            <span>
              {{ file.size }}
            </span>
          </div>

          <button
            type="button"
            class="staged-remove"
            :disabled="disabled"
            :aria-label="`Remove ${file.name}`"
            @click="removeStagedFile(file.id)"
          >
            <i class="pi pi-times"></i>
          </button>
        </article>
      </div>
    </div>

    <!-- Added attachments -->
    <div v-if="attachmentGroups.length" class="attachments-section">
      <div class="list-header">
        <strong>
          {{ $t('project.attachments_title') }}
        </strong>

        <span>
          {{ modelValue.length }}
        </span>
      </div>

      <section v-for="group in attachmentGroups" :key="group.key" class="attachment-group">
        <header class="attachment-group__header">
          <span class="type-badge">
            <i class="pi pi-tag" aria-hidden="true"></i>
            {{ group.typeName }}
          </span>
          <span>{{ $t('project.files_count', { count: group.items.length }) }}</span>
        </header>

        <div class="attachments-list">
          <article
            v-for="{ attachment, index } in group.items"
            :key="`${group.key}-${attachment.file}-${index}`"
            class="attachment-card"
          >
            <div class="file-info">
              <div
                class="file-icon-wrapper"
                :class="{
                  'is-pdf': isPdf(attachment.name, attachment.file),
                  'is-img': isImage(attachment.name, attachment.file),
                }"
              >
                <img
                  v-if="isImage(attachment.name, attachment.file)"
                  :src="attachment.file"
                  :alt="getAttachmentName(attachment, index)"
                />
                <i
                  v-else-if="isPdf(attachment.name, attachment.file)"
                  class="pi pi-file-pdf"
                  aria-hidden="true"
                ></i>
                <span v-else>
                  {{ getFileExtension(attachment.name, attachment.file) }}
                </span>
              </div>

              <div class="file-text">
                <span class="file-name" :title="getAttachmentName(attachment, index)">
                  {{ getAttachmentName(attachment, index) }}
                </span>
                <span v-if="attachment.size" class="file-size">
                  {{ attachment.size }}
                </span>
              </div>
            </div>

            <div class="attachment-alt-field">
              <label :for="`project_attachment_alt_${index}`">
                {{ $t('project.attachment_description') }}
              </label>
              <input
                :id="`project_attachment_alt_${index}`"
                type="text"
                :value="attachment.alt ?? ''"
                :disabled="disabled"
                :placeholder="$t('project.attachment_description_placeholder')"
                @input="updateAttachmentAlt(index, $event)"
              />
            </div>

            <button
              type="button"
              class="remove-btn"
              :disabled="disabled"
              :title="
                $t('project.remove_attachment', { name: getAttachmentName(attachment, index) })
              "
              :aria-label="
                $t('project.remove_attachment', { name: getAttachmentName(attachment, index) })
              "
              @click="removeAttachment(index)"
            >
              <i class="pi pi-trash" aria-hidden="true"></i>
            </button>
          </article>
        </div>
      </section>
    </div>

    <!-- Empty -->
    <div v-else-if="!stagedFiles.length" class="empty-state">
      <span class="empty-state__icon" aria-hidden="true">
        <i class="pi pi-file"></i>
      </span>

      <div>
        <strong>
          {{ $t('project.no_attachments') }}
        </strong>

        <p>
          {{ $t('project.no_attachments_hint') }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .project-attachments-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    padding: 1.25rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-lg);
    background: var(--bg-card);
  }

  /* Header */

  .section-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .section-title__icon,
  .empty-state__icon {
    display: grid;
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
    color: var(--gray-900);
    font-size: 1.05rem;
    font-weight: 700;
  }

  .section-title p {
    margin: 0.2rem 0 0;
    color: var(--gray-500);
    font-size: var(--xs-size);
  }

  .attachment-count {
    display: grid;
    min-width: 2rem;
    height: 2rem;
    padding: 0 0.5rem;
    border-radius: var(--radius-full);
    place-items: center;
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
    font-size: var(--xs-size);
    font-weight: 700;
  }

  /* Controls */

  .attachment-controls-card {
    display: grid;
    grid-template-columns: minmax(180px, 0.8fr) minmax(250px, 1.4fr) auto;
    gap: 1rem;
    align-items: end;
    padding: 1rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--gray-50);

    &.disabled {
      opacity: 0.65;
    }
  }

  .attachment-type-select,
  .file-picker {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
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

  .hidden-input {
    display: none;
  }

  /* Upload */

  .upload-dropzone {
    position: relative;
    display: flex;
    width: 100%;
    min-height: 3.25rem;
    align-items: center;
    gap: 0.75rem;
    padding: 0.55rem 0.7rem;
    border: 1px dashed var(--gray-300);
    border-radius: var(--radius-md);
    cursor: pointer;
    background: var(--white);
    color: var(--gray-700);
    text-align: start;
    transition: var(--transition-fast);

    &:hover:not(:disabled),
    &:focus-visible {
      border-color: var(--PrimaryColor);
      background: var(--PrimaryColor-alpha-4);
      outline: none;
    }

    &.has-files {
      border-color: var(--success);
      background: var(--success-light);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  .upload-icon {
    display: grid;
    flex: 0 0 auto;
    width: 2.1rem;
    height: 2.1rem;
    border-radius: var(--radius-sm);
    place-items: center;
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
  }

  .upload-copy {
    display: flex;
    flex: 1;
    min-width: 0;
    flex-direction: column;
    gap: 0.1rem;

    strong {
      overflow: hidden;
      color: var(--gray-800);
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

  .upload-action {
    display: grid;
    width: 1.8rem;
    height: 1.8rem;
    border-radius: var(--radius-sm);
    place-items: center;
    background: var(--gray-100);
    color: var(--gray-600);
  }

  /* Add button */

  .add-btn {
    display: flex;
    min-height: 3.25rem;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    padding: 0.65rem 1rem;
    border: 0;
    border-radius: var(--radius-md);
    cursor: pointer;
    background: var(--PrimaryColor);
    color: var(--white);
    font-size: var(--sm-size);
    font-weight: 600;
    white-space: nowrap;
    transition: var(--transition-fast);

    &:hover:not(:disabled) {
      background: var(--PrimaryColor-hover);
      transform: translateY(-1px);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }
  }

  .add-count {
    display: grid;
    min-width: 1.4rem;
    height: 1.4rem;
    padding: 0 0.3rem;
    border-radius: var(--radius-full);
    place-items: center;
    background: rgba(255, 255, 255, 0.2);
    font-size: 0.7rem;
  }

  .file-read-error {
    margin: 0;
    color: var(--danger);
    font-size: var(--xs-size);
  }

  /* Staged files */

  .staged-section {
    padding: 0.85rem;
    border: 1px solid var(--PrimaryColor-alpha-20);
    border-radius: var(--radius-md);
    background: var(--PrimaryColor-alpha-4);
  }

  .staged-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.75rem;

    > div {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }

    strong {
      color: var(--gray-800);
      font-size: var(--sm-size);
    }

    span {
      color: var(--gray-500);
      font-size: var(--xs-size);
    }
  }

  .clear-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.5rem;
    border: 0;
    border-radius: var(--radius-sm);
    cursor: pointer;
    background: transparent;
    color: var(--danger);
    font-size: var(--xs-size);

    &:hover {
      background: var(--danger-light);
    }
  }

  .staged-files {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 0.65rem;
  }

  .staged-file-card {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.65rem;
    padding: 0.6rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--white);
  }

  .staged-preview {
    display: grid;
    flex: 0 0 auto;
    width: 3rem;
    height: 3rem;
    overflow: hidden;
    border-radius: var(--radius-sm);
    place-items: center;
    background: var(--gray-100);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .preview-icon {
    display: grid;
    width: 100%;
    height: 100%;
    place-items: center;
    color: var(--gray-600);
    font-size: 0.6rem;
    font-weight: 800;

    &.pdf {
      background: var(--danger-light);
      color: var(--danger);
      font-size: 1.25rem;
    }
  }

  .staged-file-info {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
    gap: 0.1rem;

    strong {
      overflow: hidden;
      color: var(--gray-800);
      font-size: var(--xs-size);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    span {
      color: var(--gray-500);
      font-size: 0.7rem;
    }
  }

  .staged-remove {
    display: grid;
    flex: 0 0 auto;
    width: 1.8rem;
    height: 1.8rem;
    border: 0;
    border-radius: var(--radius-sm);
    place-items: center;
    cursor: pointer;
    background: var(--gray-100);
    color: var(--gray-500);

    &:hover {
      background: var(--danger-light);
      color: var(--danger);
    }
  }

  /* Added attachments */

  .attachments-section {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .attachment-group {
    overflow: hidden;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--white);
  }

  .attachment-group__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.65rem 0.75rem;
    border-bottom: 1px solid var(--border-weak);
    background: var(--gray-50);
    color: var(--gray-500);
    font-size: var(--xs-size);
  }

  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-inline: 0.15rem;

    strong {
      color: var(--gray-800);
      font-size: var(--sm-size);
    }

    span {
      display: grid;
      min-width: 1.6rem;
      height: 1.6rem;
      padding-inline: 0.35rem;
      border-radius: var(--radius-full);
      place-items: center;
      background: var(--gray-100);
      color: var(--gray-600);
      font-size: 0.7rem;
      font-weight: 700;
    }
  }

  .attachments-list {
    display: flex;
    flex-direction: column;
  }

  .attachment-card {
    display: grid;
    grid-template-columns: minmax(180px, 0.8fr) minmax(220px, 1.2fr) auto;
    align-items: center;
    gap: 1rem;
    padding: 0.7rem;
    background: var(--white);
    transition: var(--transition-fast);

    & + & {
      border-top: 1px solid var(--border-weak);
    }

    &:hover {
      background: var(--gray-50);
    }
  }

  .file-info {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.7rem;
  }

  .file-icon-wrapper {
    display: grid;
    flex: 0 0 auto;
    width: 2.7rem;
    height: 2.7rem;
    overflow: hidden;
    border-radius: var(--radius-sm);
    place-items: center;
    background: var(--gray-100);
    color: var(--gray-600);
    font-size: 0.6rem;
    font-weight: 800;

    &.is-pdf {
      background: var(--danger-light);
      color: var(--danger);
      font-size: 1.15rem;
    }

    &.is-img {
      background: var(--PrimaryColor-light);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .file-text {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 0.1rem;
  }

  .file-name {
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

  .attachment-alt-field {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 0.3rem;

    label {
      color: var(--gray-700);
      font-size: var(--xs-size);
      font-weight: 600;
    }

    input {
      width: 100%;
      min-height: 2.5rem;
      padding: 0.5rem 0.7rem;
      border: 1px solid var(--border-weak);
      border-radius: var(--radius-sm);
      color: var(--gray-800);
      background: var(--white);

      &:focus {
        border-color: var(--PrimaryColor);
        outline: 3px solid var(--PrimaryColor-alpha-15);
      }
    }
  }

  .type-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.35rem 0.55rem;
    border-radius: var(--radius-full);
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
    font-size: 0.7rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .remove-btn {
    display: grid;
    width: 2.25rem;
    height: 2.25rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    place-items: center;
    cursor: pointer;
    background: var(--white);
    color: var(--gray-500);
    transition: var(--transition-fast);

    &:hover:not(:disabled) {
      border-color: var(--danger);
      background: var(--danger-light);
      color: var(--danger);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  /* Empty */

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

    p {
      margin: 0.2rem 0 0;
      color: var(--gray-500);
      font-size: var(--xs-size);
    }
  }

  /* Responsive */

  @media (max-width: 900px) {
    .attachment-controls-card {
      grid-template-columns: 1fr 1fr;
    }

    .add-btn {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 640px) {
    .project-attachments-section {
      padding: 1rem;
    }

    .section-title {
      align-items: flex-start;
    }

    .attachment-controls-card {
      grid-template-columns: 1fr;
    }

    .add-btn {
      grid-column: auto;
    }

    .staged-files {
      grid-template-columns: 1fr;
    }

    .attachment-card {
      grid-template-columns: minmax(0, 1fr) auto;
    }

    .type-badge {
      grid-column: 1 / -1;
      grid-row: 2;
      width: fit-content;
    }

    .remove-btn {
      grid-column: 2;
      grid-row: 1;
    }
  }
</style>
