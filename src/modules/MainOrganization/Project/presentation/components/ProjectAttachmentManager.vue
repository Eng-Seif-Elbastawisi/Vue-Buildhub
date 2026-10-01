<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useI18n } from 'vue-i18n';

  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import IndexAttachmentTypeParams from '@/modules/MainOrganization/AttachmentType/core/params/index.attachment.type.params';
  import AttachmentTypeController from '@/modules/MainOrganization/AttachmentType/presentation/controllers/attachment.type.controller';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';

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
    file: string;
    name: string;
    size: string;
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
  const stagedFiles = ref<StagedFile[]>([]);
  const fileReadError = ref(false);

  const groupedAttachments = computed<AttachmentGroup[]>(() => {
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

  const stagedFilesLabel = computed(() => {
    if (stagedFiles.value.length === 0) return t('project.click_to_upload');
    if (stagedFiles.value.length === 1) return stagedFiles.value[0]?.name;
    return t('project.files_selected', { count: stagedFiles.value.length });
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';

    const unit = 1024;
    const units = ['B', 'KB', 'MB', 'GB'];
    const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(unit)), units.length - 1);

    return `${Number((bytes / Math.pow(unit, unitIndex)).toFixed(1))} ${units[unitIndex]}`;
  };

  const readFileAsDataUrl = (file: File): Promise<StagedFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve({
          file: String(reader.result),
          name: file.name,
          size: formatFileSize(file.size),
        });
      };
      reader.onerror = () =>
        reject(
          reader.error ?? new DOMException('Unable to read the selected file', 'NotReadableError'),
        );
      reader.readAsDataURL(file);
    });
  };

  const emitAttachmentChange = (attachments: ProjectAttachmentItem[]) => {
    emit('update:modelValue', attachments);
    emit('change', attachments);
  };

  const stageSelectedFiles = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files ?? []);

    if (files.length === 0) return;

    try {
      stagedFiles.value = await Promise.all(files.map(readFileAsDataUrl));
      fileReadError.value = false;
    } catch (error) {
      if (!(error instanceof DOMException)) throw error;

      stagedFiles.value = [];
      fileReadError.value = true;
    } finally {
      target.value = '';
    }
  };

  const addAttachments = () => {
    if (!selectedType.value?.id || stagedFiles.value.length === 0) return;

    const typeId = Number(selectedType.value.id);
    const typeName = selectedType.value.title || t('project.attachment_type_unknown');
    const newItems = stagedFiles.value.map<ProjectAttachmentItem>((stagedFile) => ({
      file: stagedFile.file,
      name: stagedFile.name,
      size: stagedFile.size,
      typeId,
      typeName,
      alt: stagedFile.name,
      link: null,
    }));

    emitAttachmentChange([...props.modelValue, ...newItems]);
    stagedFiles.value = [];
    selectedType.value = null;
  };

  const removeAttachment = (index: number) => {
    emitAttachmentChange(
      props.modelValue.filter((_, attachmentIndex) => attachmentIndex !== index),
    );
  };

  const updateAttachmentAlt = (index: number, event: Event) => {
    const alt = (event.target as HTMLInputElement).value;
    const updatedAttachments = props.modelValue.map((attachment, attachmentIndex) =>
      attachmentIndex === index ? { ...attachment, alt } : attachment,
    );

    emitAttachmentChange(updatedAttachments);
  };

  const getFileExtension = (name?: string, fileUrl?: string): string => {
    const dataMime = fileUrl?.match(/^data:([^;,]+)/i)?.[1]?.toLowerCase();

    if (dataMime === 'application/pdf') return 'PDF';
    if (dataMime?.startsWith('image/')) {
      const subtype = dataMime.split('/')[1]?.split('+')[0];
      return subtype === 'jpeg' ? 'JPG' : subtype?.toUpperCase() || 'IMG';
    }

    const source = name || fileUrl || '';
    const cleanSource = source.split(/[?#]/)[0] ?? '';
    const match = cleanSource.match(/\.([a-zA-Z0-9]+)$/);

    return match?.[1]?.toUpperCase() || 'FILE';
  };

  const isImage = (item: ProjectAttachmentItem): boolean => {
    if (item.file.startsWith('data:image/')) return true;
    return ['PNG', 'JPG', 'JPEG', 'WEBP', 'GIF', 'SVG'].includes(
      getFileExtension(item.name, item.file),
    );
  };
</script>

<template>
  <div class="project-attachments-section">
    <header class="section-title">
      <div>
        <h4>{{ $t('project.attachments_title') }}</h4>
        <p>{{ $t('project.attachments_hint') }}</p>
      </div>
      <span v-if="modelValue.length" class="attachments-count">
        {{ $t('project.files_count', { count: modelValue.length }) }}
      </span>
    </header>

    <div class="attachment-controls-card" :class="{ disabled }">
      <div class="attachment-type-select">
        <label class="control-label">
          <span class="required-star" aria-hidden="true">*</span>
          {{ $t('project.attachment_type') }}
        </label>
        <UpdatedCustomInputSelect
          id="project_attachment_type"
          v-model="selectedType"
          :controller="attachmentTypeController"
          :disabled="disabled"
          :params="indexAttachmentTypeParams"
          :placeholder="$t('project.attachment_type_placeholder')"
        />
      </div>

      <label class="upload-dropzone" :class="{ 'has-file': stagedFiles.length, disabled }">
        <input
          type="file"
          class="hidden-input"
          multiple
          :disabled="disabled"
          @change="stageSelectedFiles"
        />
        <span class="upload-icon" aria-hidden="true">
          <i class="pi pi-cloud-upload" />
        </span>
        <span class="upload-copy">
          <strong>{{ stagedFilesLabel }}</strong>
          <small>{{ $t('project.multiple_files_hint') }}</small>
        </span>
      </label>

      <button
        type="button"
        class="add-btn"
        :disabled="!selectedType || stagedFiles.length === 0 || disabled"
        :title="$t('project.add_attachments')"
        :aria-label="$t('project.add_attachments')"
        @click="addAttachments"
      >
        <i class="pi pi-plus" aria-hidden="true" />
        <span>{{ $t('project.add_attachments') }}</span>
      </button>

      <p v-if="fileReadError" class="file-read-error" role="alert">
        {{ $t('project.file_read_error') }}
      </p>
    </div>

    <div v-if="groupedAttachments.length" class="attachment-groups">
      <section v-for="group in groupedAttachments" :key="group.key" class="attachment-group">
        <header class="attachment-group__header">
          <span class="type-badge">{{ group.typeName }}</span>
          <span>{{ $t('project.files_count', { count: group.items.length }) }}</span>
        </header>

        <ul class="attachments-list">
          <li
            v-for="{ attachment, index } in group.items"
            :key="`${group.key}-${attachment.file}-${index}`"
            class="attachment-card"
          >
            <div class="file-info">
              <div class="file-icon-wrapper" :class="{ 'is-img': isImage(attachment) }">
                <img v-if="isImage(attachment)" :src="attachment.file" alt="" />
                <span v-else class="ext-badge">
                  {{ getFileExtension(attachment.name, attachment.file) }}
                </span>
              </div>

              <div class="file-text">
                <strong class="file-name">
                  {{ attachment.name || $t('project.attachment_file') }}
                </strong>
                <span v-if="attachment.size" class="file-size">{{ attachment.size }}</span>
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
              :title="$t('remove_file')"
              :aria-label="$t('remove_file')"
              @click="removeAttachment(index)"
            >
              <i class="pi pi-trash" aria-hidden="true" />
            </button>
          </li>
        </ul>
      </section>
    </div>

    <div v-else class="attachments-empty">
      <i class="pi pi-folder-open" aria-hidden="true" />
      <span>{{ $t('project.no_attachments') }}</span>
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

  .section-title,
  .attachment-group__header,
  .file-info {
    display: flex;
    align-items: center;
  }

  .section-title {
    justify-content: space-between;
    gap: 1rem;

    h4 {
      margin: 0;
      color: var(--gray-900);
      font-size: 1.1rem;
      font-weight: 700;
    }

    p {
      margin: 0.35rem 0 0;
      color: var(--gray-500);
      font-size: 0.8125rem;
    }
  }

  .attachments-count,
  .type-badge {
    border-radius: var(--radius-full);
    color: var(--PrimaryColor);
    background-color: var(--PrimaryColor-alpha-8);
    font-size: 0.75rem;
    font-weight: 600;
  }

  .attachments-count {
    padding: 0.4rem 0.75rem;
    white-space: nowrap;
  }

  .attachment-controls-card {
    display: grid;
    grid-template-columns: minmax(220px, 0.8fr) minmax(280px, 1.2fr) auto;
    align-items: end;
    gap: 1rem;
    width: 100%;
    padding: 1rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background-color: var(--gray-50);

    &.disabled {
      opacity: 0.65;
    }
  }

  .attachment-type-select {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    min-width: 0;
  }

  .control-label,
  .attachment-alt-field label {
    color: var(--gray-700);
    font-size: 0.8125rem;
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
    min-height: 48px;
    padding: 0.55rem 0.85rem;
    border: 1px dashed var(--border-strong);
    border-radius: var(--control-radius);
    color: var(--gray-600);
    text-align: start;
    background-color: var(--bg-card);

    &:hover:not(.disabled),
    &.has-file {
      border-color: var(--PrimaryColor);
      color: var(--PrimaryColor);
      background-color: var(--PrimaryColor-alpha-4);
    }

    &:focus-within {
      outline: 3px solid var(--PrimaryColor-alpha-20);
      outline-offset: 2px;
    }

    &.disabled {
      cursor: not-allowed;
      opacity: 0.65;
    }
  }

  .hidden-input {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    opacity: 0;
  }

  .upload-icon {
    display: grid;
    flex: 0 0 34px;
    width: 34px;
    height: 34px;
    place-items: center;
    border-radius: var(--radius-sm);
    background-color: var(--PrimaryColor-alpha-8);
  }

  .upload-copy {
    display: flex;
    min-width: 0;
    flex-direction: column;

    strong,
    small {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    strong {
      color: var(--gray-800);
      font-size: 0.8125rem;
    }

    small {
      color: var(--gray-500);
      font-size: 0.7rem;
    }
  }

  .add-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    min-height: 48px;
    padding: 0.65rem 1rem;
    border: 1px solid var(--PrimaryColor);
    border-radius: var(--control-radius);
    color: var(--white);
    background-color: var(--PrimaryColor);
    font-size: 0.8125rem;
    font-weight: 600;
    white-space: nowrap;

    &:hover:not(:disabled) {
      background-color: var(--PrimaryColor-hover);
    }

    .file-read-error {
      grid-column: 1 / -1;
      margin: 0;
      color: var(--danger);
      font-size: 0.75rem;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }
  }

  .attachment-groups {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .attachment-group {
    overflow: hidden;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background-color: var(--bg-card);
  }

  .attachment-group__header {
    justify-content: space-between;
    gap: 1rem;
    padding: 0.65rem 0.85rem;
    border-bottom: 1px solid var(--border-weak);
    color: var(--gray-500);
    background-color: var(--gray-50);
    font-size: 0.75rem;
  }

  .type-badge {
    padding: 0.3rem 0.65rem;
  }

  .attachments-list {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .attachment-card {
    display: grid;
    grid-template-columns: minmax(180px, 0.8fr) minmax(220px, 1.2fr) auto;
    align-items: center;
    gap: 1rem;
    padding: 0.85rem;

    & + & {
      border-top: 1px solid var(--border-weak);
    }
  }

  .file-info {
    min-width: 0;
    gap: 0.75rem;
  }

  .file-icon-wrapper {
    display: grid;
    overflow: hidden;
    flex: 0 0 42px;
    width: 42px;
    height: 42px;
    place-items: center;
    border-radius: var(--radius-sm);
    color: var(--gray-600);
    background-color: var(--gray-100);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .ext-badge {
    font-size: 0.65rem;
    font-weight: 800;
  }

  .file-text,
  .attachment-alt-field {
    display: flex;
    min-width: 0;
    flex-direction: column;
  }

  .file-name {
    overflow: hidden;
    color: var(--gray-800);
    font-size: 0.8125rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-size {
    color: var(--gray-500);
    font-size: 0.72rem;
  }

  .attachment-alt-field {
    gap: 0.3rem;

    input {
      width: 100%;
      min-height: 40px;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border-weak);
      border-radius: var(--control-radius);
      color: var(--gray-800);
      background-color: var(--bg-card);

      &:focus {
        border-color: var(--PrimaryColor);
        outline: 3px solid var(--PrimaryColor-alpha-15);
      }
    }
  }

  .remove-btn {
    display: grid;
    width: 38px;
    height: 38px;
    place-items: center;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    color: var(--gray-500);
    background-color: var(--bg-card);

    &:hover:not(:disabled) {
      border-color: var(--danger);
      color: var(--danger);
      background-color: var(--danger-light);
    }
  }

  .attachments-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 84px;
    border: 1px dashed var(--border-strong);
    border-radius: var(--radius-md);
    color: var(--gray-500);
    background-color: var(--gray-50);
    font-size: 0.8125rem;
  }

  @media (max-width: 900px) {
    .attachment-controls-card {
      grid-template-columns: 1fr 1fr;
    }

    .add-btn {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 640px) {
    .section-title {
      align-items: flex-start;
    }

    .attachment-controls-card,
    .attachment-card {
      grid-template-columns: 1fr;
    }

    .add-btn {
      grid-column: auto;
      width: 100%;
    }

    .remove-btn {
      width: 100%;
    }
  }
</style>
