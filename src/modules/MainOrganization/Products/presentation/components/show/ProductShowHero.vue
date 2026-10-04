<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import {
    attachmentGallery,
    toGalleryAttachment,
  } from '@/shared/AttachmentGallery/attachmentGallery';

  import type ProductsShowModel from '../../../core/models/products.show.model';

  const props = defineProps<{
    product: ProductsShowModel;
    title?: string;
  }>();

  const { locale } = useI18n();

  const galleryImages = computed(() => {
    const images = [
      props.product.image,
      ...props.product.attachments
        .filter((attachment) => attachment.type === 1)
        .map((attachment) => attachment.file),
    ].filter((image): image is string => Boolean(image));

    return [...new Set(images)];
  });

  const activeImage = ref('');
  const openActiveImage = () => {
    const sources = [
      ...(props.product.image ? [toGalleryAttachment({ url: props.product.image })] : []),
      ...props.product.attachments.map(toGalleryAttachment),
    ];
    const group = [...new Map(sources.map((attachment) => [attachment.url, attachment])).values()];
    attachmentGallery.open(
      group,
      group.findIndex((attachment) => attachment.url === activeImage.value),
    );
  };

  watch(
    galleryImages,
    (images) => {
      if (!images.includes(activeImage.value)) {
        activeImage.value = images[0] ?? '';
      }
    },
    { immediate: true },
  );

  const productTitle = computed(
    () =>
      props.title ||
      props.product.translations?.title?.ar ||
      props.product.translations?.title?.en ||
      '—',
  );

  const formatPrice = (price?: number | string) => {
    if (price == null || price === '') return '—';

    return new Intl.NumberFormat(locale.value === 'ar' ? 'ar-EG' : 'en-EG').format(Number(price));
  };
</script>

<template>
  <section class="hero-card">
    <div class="gallery-panel">
      <div class="main-image">
        <button
          v-if="activeImage"
          type="button"
          class="main-image__open"
          :aria-label="productTitle"
          @click="openActiveImage"
        >
          <img :src="activeImage" :alt="productTitle" />
        </button>

        <div v-else class="image-placeholder">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <path
              d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
            />
            <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
          </svg>
          <span>{{ $t('Products.show.no_image') }}</span>
        </div>

        <span v-if="galleryImages.length" class="image-count">
          {{ galleryImages.length }} {{ $t('Products.show.images') }}
        </span>
      </div>

      <div v-if="galleryImages.length > 1" class="thumbnails" role="list">
        <button
          v-for="(image, index) in galleryImages"
          :key="image"
          type="button"
          class="thumbnail"
          :class="{ active: activeImage === image }"
          :aria-label="$t('Products.show.select_image', { number: index + 1 })"
          :aria-pressed="activeImage === image"
          @click="activeImage = image"
        >
          <img :src="image" :alt="`${productTitle} ${index + 1}`" />
        </button>
      </div>
    </div>

    <div class="hero-info">
      <div class="hero-meta">
        <span class="status-pill" :class="product.isActive ? 'is-active' : 'is-inactive'">
          <span class="status-dot" aria-hidden="true"></span>
          {{ product.isActive ? $t('Products.form.active') : $t('Products.form.inactive') }}
        </span>

        <span class="product-code">#{{ product.code || '—' }}</span>
      </div>

      <div>
        <h2 class="product-name">{{ productTitle }}</h2>
        <p class="product-type">{{ product.itemType?.title || '—' }}</p>
      </div>

      <div class="chips">
        <span v-if="product.itemType?.title" class="chip">{{ product.itemType.title }}</span>
        <span v-if="product.measurementUnit?.title" class="chip chip--muted">
          {{ product.measurementUnit.title }}
        </span>
      </div>

      <p class="description">
        {{ product.description || $t('Products.show.no_description') }}
      </p>

      <div class="quick-metrics">
        <article class="metric metric--price">
          <span class="metric-icon" aria-hidden="true">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M20 12V7H9L4 12l5 5h11v-5Z" />
              <circle cx="16" cy="10" r="1" />
            </svg>
          </span>
          <span class="metric-label">{{ $t('price') }}</span>
          <strong>
            {{ formatPrice(product.expectedPrice) }}
            <small v-if="product.expectedPrice != null">{{ $t('Products.form.currency') }}</small>
          </strong>
        </article>

        <article class="metric">
          <span class="metric-icon" aria-hidden="true">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="m12 2 9 5-9 5-9-5 9-5Z" />
              <path d="m3 12 9 5 9-5M3 17l9 5 9-5" />
            </svg>
          </span>
          <span class="metric-label">{{ $t('item_type') }}</span>
          <strong>{{ product.itemType?.title || '—' }}</strong>
        </article>

        <article class="metric">
          <span class="metric-icon" aria-hidden="true">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M3 6h18M6 3v6M10 4v4M14 4v4M18 3v6M5 10v10h14V10" />
            </svg>
          </span>
          <span class="metric-label">{{ $t('measurement') }}</span>
          <strong>{{ product.measurementUnit?.title || '—' }}</strong>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .hero-card {
    display: grid;
    grid-template-columns: minmax(18rem, 0.82fr) minmax(0, 1.4fr);
    gap: 1.5rem;
    padding: 1rem;
    background: var(--bg-card);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }

  .gallery-panel {
    min-width: 0;
  }

  .main-image {
    position: relative;
    display: grid;
    overflow: hidden;
    aspect-ratio: 4 / 3;
    background: var(--gray-100);
    border-radius: var(--radius-md);
    place-items: center;

    &__open {
      width: 100%;
      height: 100%;
      padding: 0;
      border: 0;
      background: transparent;
      cursor: zoom-in;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .image-placeholder {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 0.65rem;
    color: var(--gray-400);
    font-size: var(--sm-size);
  }

  .image-count {
    position: absolute;
    inset-block-end: 0.65rem;
    inset-inline-end: 0.65rem;
    padding: 0.3rem 0.55rem;
    color: var(--gray-700);
    background: var(--bg-card);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-sm);
    font-size: var(--xs-size-2);
    font-weight: 700;
  }

  .thumbnails {
    display: flex;
    gap: 0.55rem;
    margin-top: 0.65rem;
    overflow-x: auto;
  }

  .thumbnail {
    width: 3.75rem;
    height: 3.25rem;
    overflow: hidden;
    flex: 0 0 auto;
    padding: 0;
    background: var(--gray-100);
    border: 2px solid transparent;
    border-radius: var(--radius-sm);
    cursor: pointer;

    &.active,
    &:focus-visible {
      outline: none;
      border-color: var(--PrimaryColor);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .hero-info {
    display: flex;
    min-width: 0;
    flex-direction: column;
    justify-content: center;
    gap: 0.9rem;
    padding: 0.35rem 0.5rem;
  }

  .hero-meta,
  .chips {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .hero-meta {
    justify-content: space-between;
  }

  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.65rem;
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

  .product-code {
    color: var(--gray-500);
    font-size: var(--xs-size);
    font-weight: 700;
    direction: ltr;
  }

  .product-name {
    margin: 0;
    color: var(--title-color);
    font-size: clamp(1.35rem, 2vw, 1.8rem);
    font-weight: 800;
    line-height: 1.4;
  }

  .product-type {
    margin: 0.25rem 0 0;
    color: var(--subtitle-color);
    font-size: var(--sm-size);
  }

  .chip {
    padding: 0.3rem 0.65rem;
    color: var(--info-dark);
    background: var(--info-light);
    border-radius: var(--radius-full);
    font-size: var(--xs-size);
    font-weight: 600;

    &--muted {
      color: var(--gray-600);
      background: var(--gray-100);
    }
  }

  .description {
    display: -webkit-box;
    overflow: hidden;
    margin: 0;
    color: var(--gray-600);
    font-size: var(--sm-size);
    line-height: 1.8;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  .quick-metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.65rem;
    margin-top: 0.15rem;
  }

  .metric {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0.2rem 0.55rem;
    min-width: 0;
    padding: 0.75rem;
    background: var(--gray-50);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);

    &--price .metric-icon {
      color: var(--PrimaryColor);
      background: var(--PrimaryColor-light);
    }

    strong {
      overflow: hidden;
      color: var(--title-card-color);
      font-size: var(--sm-size);
      font-weight: 800;
      text-overflow: ellipsis;
      white-space: nowrap;

      small {
        color: var(--PrimaryColor);
        font-size: var(--xs-size-2);
      }
    }
  }

  .metric-icon {
    display: grid;
    grid-row: 1 / span 2;
    width: 2.25rem;
    height: 2.25rem;
    color: var(--info-dark);
    background: var(--info-light);
    border-radius: var(--radius-sm);
    place-items: center;
  }

  .metric-label {
    color: var(--gray-500);
    font-size: var(--xs-size-2);
  }

  @media (max-width: 980px) {
    .hero-card {
      grid-template-columns: minmax(15rem, 0.8fr) minmax(0, 1.2fr);
    }

    .quick-metrics {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 700px) {
    .hero-card {
      grid-template-columns: 1fr;
    }

    .quick-metrics {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 520px) {
    .quick-metrics {
      grid-template-columns: 1fr;
    }
  }
</style>
