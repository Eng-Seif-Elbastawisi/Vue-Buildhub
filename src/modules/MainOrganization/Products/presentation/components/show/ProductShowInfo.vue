<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import {
    attachmentExtension,
    attachmentGallery,
    toGalleryAttachment,
  } from '@/shared/AttachmentGallery/attachmentGallery';

  import type AttachmentModel from '../../../core/models/attachment.model';
  import type ProductsShowModel from '../../../core/models/products.show.model';

  defineProps<{
    product: ProductsShowModel;
    title?: string;
  }>();

  const { locale } = useI18n();

  const formatPrice = (price?: number | string) => {
    if (price == null || price === '') return '—';

    return new Intl.NumberFormat(locale.value === 'ar' ? 'ar-EG' : 'en-EG').format(Number(price));
  };

  const getFileName = (attachment: AttachmentModel) => {
    return attachment.file ? toGalleryAttachment(attachment).name : '—';
  };

  const getFileType = (attachment: AttachmentModel) => {
    return attachmentExtension(getFileName(attachment)).toUpperCase() || '—';
  };
</script>

<template>
  <div class="information-grid">
    <section class="section-card">
      <header class="section-header">
        <span class="section-icon" aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h5" />
          </svg>
        </span>
        <div>
          <h3>{{ $t('Products.form.product_data') }}</h3>
          <p>{{ $t('Products.show.product_data_hint') }}</p>
        </div>
      </header>

      <dl class="data-list">
        <div class="data-row">
          <dt>{{ $t('Products.form.product_name') }}</dt>
          <dd>{{ title || '—' }}</dd>
        </div>

        <div class="data-row">
          <dt>{{ $t('item_type') }}</dt>
          <dd>{{ product.itemType?.title || '—' }}</dd>
        </div>

        <div class="data-row">
          <dt>{{ $t('Products.show.product_code') }}</dt>
          <dd class="code-value">#{{ product.code || '—' }}</dd>
        </div>

        <div class="data-row">
          <dt>{{ $t('measurement') }}</dt>
          <dd>{{ product.measurementUnit?.title || '—' }}</dd>
        </div>

        <div class="data-row">
          <dt>{{ $t('Products.form.expected_price') }}</dt>
          <dd class="price-value">
            {{ formatPrice(product.expectedPrice) }}
            <small v-if="product.expectedPrice != null">{{ $t('Products.form.currency') }}</small>
          </dd>
        </div>

        <div v-if="product.quantity != null" class="data-row">
          <dt>{{ $t('Products.form.quantity') }}</dt>
          <dd>{{ formatPrice(product.quantity) }}</dd>
        </div>

        <div class="data-row">
          <dt>{{ $t('Products.form.status') }}</dt>
          <dd>
            <span class="status-pill bh-status" :class="product.isActive ? 'is-active' : 'is-inactive'">
              <span class="status-dot" aria-hidden="true"></span>
              {{ product.isActive ? $t('Products.form.active') : $t('Products.form.inactive') }}
            </span>
          </dd>
        </div>
      </dl>
    </section>

    <section class="section-card">
      <header class="section-header">
        <span class="section-icon" aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16h16V8z" />
            <path d="M14 2v6h6M8 13h8M8 17h6" />
          </svg>
        </span>
        <div>
          <h3>{{ $t('Products.show.attachments_title') }}</h3>
          <p>{{ $t('Products.show.attachments_hint') }}</p>
        </div>
        <span class="count-badge">{{ product.attachments.length }}</span>
      </header>

      <div v-if="product.attachments.length" class="attachments-list">
        <article
          v-for="(attachment, index) in product.attachments"
          :key="attachment.id ?? attachment.file"
          class="attachment-row"
        >
          <span class="file-icon" aria-hidden="true">
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16h16V8z" />
              <path d="M14 2v6h6" />
            </svg>
          </span>

          <div class="file-copy">
            <strong :title="getFileName(attachment)">{{ getFileName(attachment) }}</strong>
            <span>{{ getFileType(attachment) }}</span>
          </div>

          <button
            type="button"
            class="attachment-view-btn"
            :title="$t('preview_attachment')"
            :aria-label="$t('preview_attachment')"
            @click="attachmentGallery.open(product.attachments.map(toGalleryAttachment), index)"
          >
            <i class="pi pi-eye" aria-hidden="true" />
          </button>
        </article>
      </div>

      <div v-else class="empty-attachments">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16h16V8zM14 2v6h6" />
        </svg>
        <span>{{ $t('Products.show.no_attachments') }}</span>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.information-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.section-card {
  min-width: 0;
  padding: 1.15rem;
  background: var(--bg-card);
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-lg);
  box-shadow: none;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 1rem;

  h3 {
    margin: 0;
    color: var(--title-color);
    font-size: var(--md-size);
    font-weight: 800;
  }

  p {
    margin: 0.15rem 0 0;
    color: var(--subtitle-color);
    font-size: var(--xs-size);
  }
}

.section-icon {
  display: grid;
  flex: 0 0 2.4rem;
  width: 2.4rem;
  height: 2.4rem;
  color: var(--PrimaryColor);
  background: var(--PrimaryColor-light);
  border-radius: var(--radius-sm);
  place-items: center;
}

.count-badge {
  display: grid;
  min-width: 1.75rem;
  height: 1.75rem;
  margin-inline-start: auto;
  padding-inline: 0.45rem;
  color: var(--gray-600);
  background: var(--gray-100);
  border-radius: var(--radius-full);
  font-size: var(--xs-size);
  font-weight: 700;
  place-items: center;
}

.data-list {
  overflow: hidden;
  margin: 0;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-sm);
}

.data-row {
  display: grid;
  grid-template-columns: minmax(8rem, 0.8fr) minmax(0, 1.2fr);
  min-height: 2.75rem;
  border-bottom: 1px solid var(--border-weak);

  &:last-child {
    border-bottom: 0;
  }

  &:nth-child(even) {
    background: var(--gray-50);
  }

  dt,
  dd {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 0.65rem 0.75rem;
    font-size: var(--sm-size);
  }

  dt {
    color: var(--gray-500);
    border-inline-end: 1px solid var(--border-weak);
  }

  dd {
    min-width: 0;
    color: var(--title-card-color);
    font-weight: 700;
  }
}

.code-value {
  direction: ltr;
}

.data-row .price-value {
  color: var(--PrimaryColor);

  small {
    margin-inline-start: 0.25rem;
    font-size: var(--xs-size-2);
  }
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-full);
  font-size: var(--xs-size);
  font-weight: 700;

  &.is-active {
    color: var(--success-dark);
    background: var(--success-light);
  }

  &.is-inactive {
    color: var(--danger-dark);
    background: var(--danger-light);
  }
}

.status-dot {
  width: 0.4rem;
  height: 0.4rem;
  background: currentColor;
  border-radius: var(--radius-full);
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.attachment-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
  padding: 0.7rem;
  background: var(--gray-50);
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-sm);
}

.file-icon {
  display: grid;
  flex: 0 0 2.25rem;
  width: 2.25rem;
  height: 2.25rem;
  color: var(--danger);
  background: var(--danger-light);
  border-radius: var(--radius-sm);
  place-items: center;
}

.file-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 0.1rem;

  strong {
    overflow: hidden;
    color: var(--title-card-color);
    font-size: var(--sm-size);
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    color: var(--gray-500);
    font-size: var(--xs-size-2);
  }
}

.attachment-view-btn {
  display: grid;
  flex: 0 0 2.25rem;
  width: 2.25rem;
  height: 2.25rem;
  color: var(--gray-600);
  background: var(--bg-card);
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: var(--transition-fast);
  place-items: center;

  &:hover,
  &:focus-visible {
    outline: none;
    color: var(--PrimaryColor);
    border-color: var(--PrimaryColor);
  }
}

.empty-attachments {
  display: flex;
  min-height: 11rem;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.5rem;
  color: var(--gray-400);
  background: var(--gray-50);
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-sm);
  font-size: var(--sm-size);
}

@media (max-width: 900px) {
  .information-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .data-row {
    grid-template-columns: 1fr;

    dt {
      padding-bottom: 0.15rem;
      border-inline-end: 0;
    }

    dd {
      padding-top: 0.15rem;
    }
  }
}
</style>
