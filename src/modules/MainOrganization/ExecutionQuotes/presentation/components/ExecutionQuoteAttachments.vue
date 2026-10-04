<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import {
    attachmentExtension,
    attachmentGallery,
    attachmentKind,
    toGalleryAttachment,
  } from '@/shared/AttachmentGallery/attachmentGallery';
  import type { ExecutionQuoteAttachmentSummary } from '../../core/models/execution.quote.show.model';

  const props = defineProps<{ attachments: ExecutionQuoteAttachmentSummary[] }>();
  const { locale, t } = useI18n();
  const galleryAttachments = () =>
    props.attachments.map((attachment) =>
      toGalleryAttachment({
        ...attachment,
        url: attachment.file || attachment.link,
      }),
    );
  const attachmentSource = (attachment: ExecutionQuoteAttachmentSummary) =>
    attachment.file || attachment.link || '';
  const attachmentFileName = (attachment: ExecutionQuoteAttachmentSummary, index: number) =>
    attachment.alt?.trim() ||
    galleryAttachments()[index]?.name ||
    t('execution_quote.show.attachment_number', { number: index + 1 });
  const attachmentTypeLabel = (attachment: ExecutionQuoteAttachmentSummary) =>
    attachmentExtension(
      attachmentFileName(attachment, 0),
      attachmentSource(attachment),
    ).toUpperCase() || t('execution_quote.show.file_type');
  const formatAttachmentDate = (rawDate: string | undefined) => {
    if (!rawDate) return '';
    const date = new Date(rawDate.includes(' ') ? rawDate.replace(' ', 'T') : rawDate);
    return Number.isNaN(date.getTime())
      ? rawDate
      : new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(date);
  };
  const openPreview = (index: number) => attachmentGallery.open(galleryAttachments(), index);
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
          @click="openPreview(attachmentIndex)"
        >
          <span class="quote-attachments__preview" aria-hidden="true">
            <img
              v-if="
                attachmentKind(galleryAttachments()[attachmentIndex]!) === 'image' &&
                attachmentSource(attachment)
              "
              :src="attachmentSource(attachment)"
              alt=""
              loading="lazy"
            />
            <i
              v-else
              :class="
                attachmentKind(galleryAttachments()[attachmentIndex]!) === 'pdf'
                  ? 'pi pi-file-pdf'
                  : 'pi pi-file'
              "
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
  .quote-attachments__meta > span {
    display: flex;
    align-items: center;
  }

  .quote-attachments__header {
    justify-content: space-between;
    gap: 1rem;
  }

  .quote-attachments__heading {
    gap: 0.75rem;
    text-align: start;
  }

  .quote-attachments__heading-icon {
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
  .quote-attachments p {
    margin: 0;
  }

  .quote-attachments h2 {
    color: var(--title-card-color);
    font-size: 1.05rem;
  }

  .quote-attachments p {
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

  .quote-attachments__empty {
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

  .quote-attachments__empty > span {
    font-size: 2rem;
    color: var(--PrimaryColor);
  }

  @media (max-width: 640px) {
    .quote-attachments__header {
      align-items: stretch;
      flex-direction: column;
    }

    .quote-attachments__count {
      align-self: flex-start;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .quote-attachments__card {
      transition: none;
    }
  }
</style>
