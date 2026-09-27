<script setup lang="ts">
  import Dialog from 'primevue/dialog';
  import { computed, ref } from 'vue';
  import { useI18n } from 'vue-i18n';

  import AppButton from '@/shared/HelpersComponents/AppButton.vue';

  import type { ExecutionQuoteAttachmentSummary } from '../../core/models/execution.quote.show.model';

  type AttachmentKind = 'image' | 'pdf' | 'file';

  defineProps<{
    attachments: ExecutionQuoteAttachmentSummary[];
  }>();

  const { locale, t } = useI18n();
  const previewVisible = ref(false);
  const selectedAttachment = ref<ExecutionQuoteAttachmentSummary | null>(null);
  const selectedAttachmentIndex = ref(0);

  const imageExtensions = new Set(['avif', 'bmp', 'gif', 'jpeg', 'jpg', 'png', 'svg', 'webp']);

  const attachmentSource = (attachment: ExecutionQuoteAttachmentSummary | null) => {
    const source = (attachment?.file || attachment?.link || '').trim();
    return /^(?:javascript|vbscript):/i.test(source) ? '' : source;
  };

  const attachmentExtension = (attachment: ExecutionQuoteAttachmentSummary | null) => {
    const source = attachmentSource(attachment);
    const dataMime = source.match(/^data:([^;,]+)/i)?.[1]?.toLowerCase();

    if (dataMime === 'application/pdf') return 'pdf';
    if (dataMime?.startsWith('image/')) {
      return dataMime.split('/')[1]?.split('+')[0] ?? 'image';
    }

    const path = source.split(/[?#]/)[0] ?? '';
    const extension = path.includes('.') ? path.split('.').pop()?.toLowerCase() : undefined;
    return extension && extension.length <= 8 ? extension : undefined;
  };

  const attachmentKind = (attachment: ExecutionQuoteAttachmentSummary | null): AttachmentKind => {
    const extension = attachmentExtension(attachment);
    if (extension === 'pdf') return 'pdf';
    return extension && imageExtensions.has(extension) ? 'image' : 'file';
  };

  const attachmentFileName = (attachment: ExecutionQuoteAttachmentSummary, index: number) => {
    if (attachment.alt?.trim()) return attachment.alt.trim();

    const source = attachmentSource(attachment);
    const fileName = source.startsWith('data:') ? '' : source.split(/[?#]/)[0]?.split('/').pop();
    return fileName || t('execution_quote.show.attachment_number', { number: index + 1 });
  };

  const attachmentTypeLabel = (attachment: ExecutionQuoteAttachmentSummary) =>
    attachmentExtension(attachment)?.toUpperCase() ?? t('execution_quote.show.file_type');

  const formatAttachmentDate = (rawDate: string | undefined) => {
    if (!rawDate) return '';

    const date = new Date(rawDate.includes(' ') ? rawDate.replace(' ', 'T') : rawDate);
    if (Number.isNaN(date.getTime())) return rawDate;

    return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(date);
  };

  const openPreview = (attachment: ExecutionQuoteAttachmentSummary, attachmentIndex: number) => {
    selectedAttachment.value = attachment;
    selectedAttachmentIndex.value = attachmentIndex;
    previewVisible.value = true;
  };

  const closePreview = () => {
    previewVisible.value = false;
  };

  const resetPreview = () => {
    selectedAttachment.value = null;
    selectedAttachmentIndex.value = 0;
  };

  const selectedSource = computed(() => attachmentSource(selectedAttachment.value));
  const selectedKind = computed(() => attachmentKind(selectedAttachment.value));
  const selectedName = computed(() =>
    selectedAttachment.value
      ? attachmentFileName(selectedAttachment.value, selectedAttachmentIndex.value)
      : '',
  );
</script>

<template>
  <section class="quote-attachments">
    <header class="quote-attachments__header">
      <div class="quote-attachments__heading">
        <span class="quote-attachments__heading-icon" aria-hidden="true">
          <i class="pi pi-paperclip"></i>
        </span>
        <div>
          <h2>{{ $t('execution_quote.show.attachments_section') }}</h2>
          <p>{{ $t('execution_quote.show.attachments_section_hint') }}</p>
        </div>
      </div>

      <span class="quote-attachments__count">
        {{ $t('execution_quote.show.attachments_count', { count: attachments.length }) }}
      </span>
    </header>

    <ul v-if="attachments.length" class="quote-attachments__grid">
      <li
        v-for="(attachment, attachmentIndex) in attachments"
        :key="attachment.id ?? (attachmentSource(attachment) || `attachment-${attachmentIndex}`)"
      >
        <button
          type="button"
          class="quote-attachments__card"
          :aria-label="
            $t('execution_quote.show.preview_attachment', {
              name: attachmentFileName(attachment, attachmentIndex),
            })
          "
          @click="openPreview(attachment, attachmentIndex)"
        >
          <span class="quote-attachments__preview" aria-hidden="true">
            <img
              v-if="attachmentKind(attachment) === 'image' && attachmentSource(attachment)"
              :src="attachmentSource(attachment)"
              alt=""
              loading="lazy"
            />
            <i
              v-else
              :class="attachmentKind(attachment) === 'pdf' ? 'pi pi-file-pdf' : 'pi pi-file'"
            ></i>
          </span>

          <span class="quote-attachments__meta">
            <strong>{{ attachmentFileName(attachment, attachmentIndex) }}</strong>
            <span>
              <small class="quote-attachments__type">{{ attachmentTypeLabel(attachment) }}</small>
              <small v-if="attachment.fileSize">{{ attachment.fileSize }}</small>
              <small v-if="attachment.createdAt">{{
                formatAttachmentDate(attachment.createdAt)
              }}</small>
            </span>
          </span>

          <span class="quote-attachments__view" aria-hidden="true">
            <i class="pi pi-eye"></i>
          </span>
        </button>
      </li>
    </ul>

    <div v-else class="quote-attachments__empty">
      <span aria-hidden="true"><i class="pi pi-folder-open"></i></span>
      <div>
        <strong>{{ $t('execution_quote.show.no_attachments') }}</strong>
        <p>{{ $t('execution_quote.show.no_attachments_hint') }}</p>
      </div>
    </div>
  </section>

  <Dialog
    v-model:visible="previewVisible"
    modal
    append-to="body"
    class="quote-attachment-dialog"
    :dismissable-mask="true"
    :draggable="false"
    @hide="resetPreview"
  >
    <template #header>
      <div class="quote-attachment-dialog__header">
        <span aria-hidden="true">
          <i class="pi pi-file"></i>
        </span>
        <div>
          <h2>{{ selectedName }}</h2>
          <p>{{ $t('execution_quote.show.attachment_preview_hint') }}</p>
        </div>
      </div>
    </template>

    <div class="quote-attachment-dialog__viewer">
      <img
        v-if="selectedKind === 'image' && selectedSource"
        :src="selectedSource"
        :alt="selectedName"
      />
      <iframe
        v-else-if="selectedKind === 'pdf' && selectedSource"
        :src="selectedSource"
        :title="selectedName"
      ></iframe>
      <div v-else class="quote-attachment-dialog__unsupported">
        <span aria-hidden="true"><i class="pi pi-file"></i></span>
        <h3>{{ $t('execution_quote.show.preview_unavailable') }}</h3>
        <p>{{ $t('execution_quote.show.preview_unavailable_hint') }}</p>
      </div>
    </div>

    <template #footer>
      <div class="quote-attachment-dialog__actions">
        <AppButton theme="secondary" outline @click="closePreview">
          {{ $t('execution_quote.show.close_preview') }}
        </AppButton>
        <a
          v-if="selectedSource"
          class="quote-attachment-dialog__open"
          :href="selectedSource"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i class="pi pi-external-link" aria-hidden="true"></i>
          {{ $t('execution_quote.show.open_original') }}
        </a>
      </div>
    </template>
  </Dialog>
</template>

<style scoped lang="scss">
  .quote-attachments {
    display: grid;
    gap: 1.25rem;
    padding: 1.25rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--bg-card);
    box-shadow: var(--shadow-sm);
  }

  .quote-attachments__header,
  .quote-attachments__heading,
  .quote-attachments__card,
  .quote-attachments__meta > span,
  .quote-attachment-dialog__header,
  .quote-attachment-dialog__actions,
  .quote-attachment-dialog__open {
    display: flex;
    align-items: center;
  }

  .quote-attachments__header {
    justify-content: space-between;
    gap: 1rem;
  }

  .quote-attachments__heading,
  .quote-attachment-dialog__header {
    gap: 0.75rem;
    text-align: start;
  }

  .quote-attachments__heading-icon,
  .quote-attachment-dialog__header > span {
    display: grid;
    flex: 0 0 2.75rem;
    width: 2.75rem;
    height: 2.75rem;
    place-items: center;
    border-radius: var(--radius-sm);
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
  }

  .quote-attachments h2,
  .quote-attachments p,
  .quote-attachment-dialog h2,
  .quote-attachment-dialog h3,
  .quote-attachment-dialog p {
    margin: 0;
  }

  .quote-attachments h2,
  .quote-attachment-dialog h2 {
    color: var(--title-card-color);
    font-size: 1.05rem;
  }

  .quote-attachments p,
  .quote-attachment-dialog__header p {
    color: var(--subtitle-color);
    font-size: var(--sm-size);
  }

  .quote-attachments__count {
    flex: 0 0 auto;
    padding: 0.35rem 0.7rem;
    border-radius: var(--radius-full);
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
    font-size: var(--xs-size);
    font-weight: 800;
  }

  .quote-attachments__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
    gap: 0.75rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .quote-attachments__card {
    width: 100%;
    min-height: 5.5rem;
    gap: 0.85rem;
    padding: 0.75rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    background: var(--bg-section);
    color: inherit;
    font: inherit;
    text-align: start;
    cursor: pointer;
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast),
      transform var(--transition-fast);
  }

  .quote-attachments__card:hover {
    border-color: var(--PrimaryColor-alpha-30);
    box-shadow: var(--shadow-sm);
    transform: translateY(-2px);
  }

  .quote-attachments__card:focus-visible {
    outline: 3px solid var(--PrimaryColor-alpha-20);
    outline-offset: 2px;
  }

  .quote-attachments__preview {
    display: grid;
    flex: 0 0 4rem;
    width: 4rem;
    height: 4rem;
    overflow: hidden;
    place-items: center;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    background: var(--bg-card);
    color: var(--PrimaryColor);
    font-size: 1.5rem;
  }

  .quote-attachments__preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .quote-attachments__meta {
    display: grid;
    flex: 1;
    min-width: 0;
    gap: 0.45rem;
  }

  .quote-attachments__meta strong {
    overflow: hidden;
    color: var(--title-card-color);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .quote-attachments__meta > span {
    flex-wrap: wrap;
    gap: 0.45rem;
    color: var(--subtitle-color);
  }

  .quote-attachments__type {
    padding: 0.15rem 0.4rem;
    border-radius: var(--radius-full);
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
    font-weight: 800;
  }

  .quote-attachments__view {
    display: grid;
    flex: 0 0 2rem;
    width: 2rem;
    height: 2rem;
    place-items: center;
    border-radius: var(--radius-full);
    color: var(--PrimaryColor);
    background: var(--bg-card);
  }

  .quote-attachments__empty,
  .quote-attachment-dialog__unsupported {
    display: grid;
    place-items: center;
    gap: 0.5rem;
    min-height: 10rem;
    padding: 1.5rem;
    border: 1px dashed var(--border-weak);
    border-radius: var(--radius-sm);
    background: var(--bg-section);
    color: var(--subtitle-color);
    text-align: center;
  }

  .quote-attachments__empty > span,
  .quote-attachment-dialog__unsupported > span {
    font-size: 2rem;
    color: var(--PrimaryColor);
  }

  :global(.quote-attachment-dialog.p-dialog) {
    --p-dialog-background: var(--bg-card);
    --p-dialog-color: var(--title-card-color);

    width: min(64rem, calc(100vw - 2rem));
    overflow: hidden;
    border: 1px solid var(--border-weak);
    background: var(--bg-card);
    color: var(--title-card-color);
  }

  :global(.quote-attachment-dialog .p-dialog-header),
  :global(.quote-attachment-dialog .p-dialog-content),
  :global(.quote-attachment-dialog .p-dialog-footer) {
    background: var(--bg-card);
    color: var(--title-card-color);
  }

  :global(.quote-attachment-dialog .p-dialog-header) {
    border-block-end: 1px solid var(--border-weak);
  }

  :global(.quote-attachment-dialog .p-dialog-footer) {
    border-block-start: 1px solid var(--border-weak);
  }

  .quote-attachment-dialog__viewer {
    display: grid;
    min-height: min(65vh, 36rem);
    overflow: hidden;
    place-items: center;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    background: var(--bg-section);
  }

  .quote-attachment-dialog__viewer > img,
  .quote-attachment-dialog__viewer > iframe {
    width: 100%;
    height: min(65vh, 36rem);
    border: 0;
  }

  .quote-attachment-dialog__viewer > img {
    object-fit: contain;
  }

  .quote-attachment-dialog__unsupported {
    width: min(28rem, calc(100% - 2rem));
    min-height: 14rem;
    background: var(--bg-card);
  }

  .quote-attachment-dialog__actions {
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .quote-attachment-dialog__open {
    justify-content: center;
    gap: 0.45rem;
    min-height: 2.75rem;
    padding-inline: 1rem;
    border-radius: var(--radius-sm);
    background: var(--PrimaryColor);
    color: var(--white);
    font-weight: 700;
    text-decoration: none;
  }

  @media (max-width: 640px) {
    .quote-attachments__header,
    .quote-attachment-dialog__actions {
      align-items: stretch;
      flex-direction: column;
    }

    .quote-attachments__count {
      align-self: flex-start;
    }

    .quote-attachment-dialog__actions > *,
    .quote-attachment-dialog__open {
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .quote-attachments__card {
      transition: none;
    }
  }
</style>
