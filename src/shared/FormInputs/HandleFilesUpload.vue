<script setup lang="ts">
  import { ref, onMounted, computed, watch } from 'vue';

  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import {
    attachmentExtension,
    attachmentGallery,
    attachmentKind,
  } from '@/shared/AttachmentGallery/attachmentGallery';

  export interface UploadedFile {
    id: string;
    name: string;
    type: string;
    size: string;
    url: string;
    base64: string;
    file?: File;
  }

  interface Props {
    label?: string;
    accept?: string;
    maxFiles?: number;
    className?: string;
    multiple?: boolean;
    index?: number;
    haveContent?: boolean;
    file?: string | string[];
    base64File?: string | string[];
    hidepreview?: boolean;
    helpTitle?: string;
    helpText?: string;
    helpExamples?: string[];
    showHelp?: boolean;
    required?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    label: 'upload_files',
    accept: [
      // Images
      'image/*',
      // Documents
      '.pdf',
      '.doc',
      '.docx',
      '.xls',
      '.xlsx',
      '.ppt',
      '.pptx',
      '.txt',
      '.csv',
      '.rtf',
      // Archives
      '.zip',
      '.rar',
      '.7z',
      '.tar',
      '.gz',
      // Code / misc
      '.json',
      '.xml',
      '.yaml',
      '.yml',
    ].join(','),
    maxFiles: Infinity,
    multiple: false,
    helpTitle: '',
    helpText: '',
    helpExamples: () => [],
    showHelp: true,
    required: false,
  });

  const emit = defineEmits<{
    change: [files: UploadedFile[]];
    processing: [active: boolean];
    error: [];
  }>();

  const files = ref<UploadedFile[]>([]);
  const processing = ref(false);
  const conversionFailed = ref(false);

  // ─── MIME type map for preloaded files (by extension) ──────────────────────
  const EXT_MIME_MAP: Record<string, string> = {
    // Images
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    csv: 'text/csv',
    rtf: 'application/rtf',
    // Archives
    zip: 'application/zip',
    rar: 'application/vnd.rar',
    '7z': 'application/x-7z-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip',
    // Code / misc
    json: 'application/json',
    xml: 'application/xml',
    yaml: 'text/yaml',
    yml: 'text/yaml',
  };

  // ─── Icon map: extension → emoji/label for non-image previews ─────────────
  const EXT_ICON_MAP: Record<string, string> = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    ppt: '📑',
    pptx: '📑',
    zip: '🗜️',
    rar: '🗜️',
    '7z': '🗜️',
    tar: '🗜️',
    gz: '🗜️',
    txt: '📃',
    csv: '📃',
    rtf: '📃',
    json: '{ }',
    xml: '</>',
    yaml: '⚙️',
    yml: '⚙️',
  };

  const initFilesFromProps = (
    file: string | string[] | undefined,
    base64File: string | string[] | undefined,
  ) => {
    if (!file && !base64File) return;

    const fileList = Array.isArray(file) ? file : file ? [file] : [];
    const base64List = Array.isArray(base64File) ? base64File : base64File ? [base64File] : [];

    files.value = fileList.map((url, i) => {
      let name = 'file';
      let ext = '';
      let dataMime = '';
      if (url.startsWith('data:')) {
        const match = url.match(/^data:([^;]+);/);
        dataMime = match?.[1] ?? '';
        ext = dataMime.split('/').pop() ?? '';
        name = `file.${ext}`;
      } else {
        name = url.split(/[?#]/)[0]?.split('/').pop() ?? 'file';
        ext = attachmentExtension(name);
      }
      const type = dataMime || EXT_MIME_MAP[ext] || 'application/octet-stream';

      return {
        id: Math.random().toString(36).substring(2),
        name,
        type,
        size: '',
        url,
        base64: base64List[i] ?? (url.startsWith('data:') ? url : ''),
      };
    });
  };

  onMounted(() => initFilesFromProps(props.file, props.base64File));

  watch(
    () => props.file,
    (newFile) => initFilesFromProps(newFile, props.base64File),
  );

  const isMaxReached = computed(() => files.value.length >= props.maxFiles);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (processing.value || !input.files?.length) return;
    processing.value = true;
    conversionFailed.value = false;
    emit('processing', true);
    try {
      const remaining = props.maxFiles - files.value.length;
      const incoming = Array.from(input.files).slice(0, remaining);

      const newFiles: UploadedFile[] = await Promise.all(
        incoming.map(async (file) => {
          const base64 = await fileToBase64(file);
          return {
            id: Math.random().toString(36).substring(2),
            name: file.name,
            type: file.type || resolveMime(file.name), // fallback for OS edge cases
            size: formatFileSize(file.size),
            url: URL.createObjectURL(file),
            base64,
            file,
          };
        }),
      );

      files.value = [...files.value, ...newFiles];
      emit('change', files.value);
    } catch {
      conversionFailed.value = true;
      emit('error');
    } finally {
      input.value = '';
      processing.value = false;
      emit('processing', false);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const resolveMime = (name: string): string => {
    const ext = attachmentExtension(name);
    return EXT_MIME_MAP[ext] ?? 'application/octet-stream';
  };

  const isImage = (file: UploadedFile): boolean =>
    attachmentKind({ url: file.url, name: file.name, mimeType: file.type }) === 'image';

  /** Returns an emoji icon or the uppercased extension label */
  const getFileIcon = (file: UploadedFile): string => {
    const ext = attachmentExtension(file.name);
    return EXT_ICON_MAP[ext] ?? (ext.toUpperCase() || 'FILE');
  };

  const openFile = (index: number) => {
    attachmentGallery.open(
      files.value.map((file) => ({ url: file.url, name: file.name, mimeType: file.type })),
      index,
    );
  };

  const removeFile = (id: string) => {
    const target = files.value.find((f) => f.id === id);
    if (target?.url.startsWith('blob:')) URL.revokeObjectURL(target.url);
    files.value = files.value.filter((f) => f.id !== id);
    emit('change', files.value);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const inputId = `file-upload-${props.index ?? Math.random().toString(36).substring(2)}`;
</script>

<template>
  <div class="file-upload-wrapper">
    <span class="field-help-label-row">
      <label class="upload-label" :for="inputId">
        {{ $t(label) }}
        <span v-if="required" class="upload-label__required" aria-hidden="true">*</span>
      </label>

      <FieldHelpIcon
        :label="$t(label)"
        :field-name="label"
        :field-id="inputId"
        :help-title="helpTitle"
        :help-text="helpText"
        :help-examples="helpExamples"
        :show-help="showHelp"
      />
    </span>

    <label
      v-if="!haveContent"
      :for="inputId"
      :class="[className ?? 'upload-area', { disabled: isMaxReached }]"
    >
      <i class="upload-icon pi pi-cloud-upload" aria-hidden="true"></i>
      <span class="upload-text">
        {{ isMaxReached ? $t('max_files_reached', { max: maxFiles }) : $t('click_to_upload') }}
      </span>
      <input
        :id="inputId"
        type="file"
        :accept="accept"
        :disabled="isMaxReached || processing"
        :multiple="multiple"
        :required="required"
        :aria-required="required || undefined"
        class="upload-native-input"
        @change="handleFileUpload"
      />
    </label>
    <label v-else :for="inputId" :class="[className ?? 'upload-area', { disabled: isMaxReached }]">
      <slot name="content"></slot>
      <input
        :id="inputId"
        type="file"
        :accept="accept"
        :disabled="isMaxReached || processing"
        :multiple="multiple"
        :required="required"
        :aria-required="required || undefined"
        class="upload-native-input"
        @change="handleFileUpload"
      />
    </label>

    <p v-if="processing" role="status">{{ $t('attachment_processing') }}</p>
    <p v-if="conversionFailed" role="alert">{{ $t('attachment_conversion_failed') }}</p>
    <div v-if="files.length && !hidepreview" class="preview-grid">
      <div
        v-for="(fileItem, fileIndex) in files"
        :key="fileItem.id"
        class="preview-item"
        :title="$t('attachments')"
      >
        <button
          type="button"
          class="preview-open"
          :aria-label="fileItem.name"
          @click="openFile(fileIndex)"
        >
          <template v-if="isImage(fileItem)">
            <img :src="fileItem.url" :alt="fileItem.name" class="preview-thumb" />
          </template>

          <template v-else>
            <div class="preview-icon">
              {{ getFileIcon(fileItem) }}
            </div>
          </template>

          <div class="preview-overlay">
            <span class="preview-filename">{{ fileItem.name }}</span>
            <span class="preview-size">{{ fileItem.size }}</span>
          </div>
        </button>

        <button
          type="button"
          class="remove-btn"
          :title="$t('remove_file')"
          @click.stop="removeFile(fileItem.id)"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .preview-open {
    display: block;
    width: 100%;
    height: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .upload-native-input {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  label:has(.upload-native-input:focus-visible) {
    outline: 2px solid var(--bh-focus);
    outline-offset: 3px;
  }

  .file-upload-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .upload-label {
    color: var(--bh-text);
    font-size: var(--bh-text-sm);
    font-weight: 600;
  }

  .upload-label__required {
    color: var(--danger);
  }

  .upload-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 20px;
    border: 1.5px dashed var(--bh-field-line);
    border-radius: var(--bh-radius-control);
    cursor: pointer;
    transition:
      border-color 0.15s,
      background 0.15s;
    background: var(--bh-surface);
  }

  .upload-area:hover:not(.disabled) {
    border-color: var(--PrimaryColor);
    background: var(--PrimaryColor-light);
  }

  .upload-area.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .upload-icon {
    font-size: var(--bh-text-sm);
    color: var(--bh-muted);
  }

  .upload-text {
    font-size: 13px;
    color: var(--bh-muted);
  }

  .preview-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .preview-item {
    position: relative;
    width: 100px;
    height: 100px;
    border-radius: 8px;
    border: 1px solid var(--gray-200);
    overflow: hidden;
    cursor: pointer;
    background: var(--gray-100);
    flex-shrink: 0;
    transition:
      border-color 0.15s,
      transform 0.15s;
  }

  .preview-item:hover {
    border-color: var(--PrimaryColor);
    transform: translateY(-2px);
  }

  .preview-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .preview-icon {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: var(--bh-muted);
    letter-spacing: 0.05em;
  }

  .preview-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, var(--black-alpha-60));
    padding: 20px 6px 5px;
    display: flex;
    flex-direction: column;
    gap: 1px;
    opacity: 0;
    transition: opacity 0.15s;
  }

  .preview-item:hover .preview-overlay {
    opacity: 1;
  }

  .preview-filename {
    font-size: 10px;
    color: var(--BgWhite);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
  }

  .preview-size {
    font-size: 9px;
    color: var(--white-alpha-75);
  }

  .remove-btn {
    position: absolute;
    inset-block-start: 4px;
    inset-inline-end: 4px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: none;
    background: var(--black-alpha-45);
    color: var(--BgWhite);
    font-size: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 1;
    transition:
      opacity 0.15s,
      background 0.15s;
    z-index: 10;
  }

  .preview-item:hover .remove-btn {
    opacity: 1;
  }

  .remove-btn:hover {
    background: var(--danger);
  }
</style>
