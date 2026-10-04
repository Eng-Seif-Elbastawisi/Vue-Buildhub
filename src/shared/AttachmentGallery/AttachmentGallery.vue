<script setup lang="ts">
  import { computed, onUnmounted, ref, watch } from 'vue';
  import Dialog from 'primevue/dialog';
  import Galleria from 'primevue/galleria';
  import Button from 'primevue/button';
  import { useToast } from 'primevue/usetoast';
  import { useI18n } from 'vue-i18n';

  import { attachmentExtension, attachmentGallery, attachmentKind } from './attachmentGallery';

  const { t, locale } = useI18n();
  const toast = useToast();

  const { attachments, activeIndex, visible, current } = attachmentGallery;

  const isRtl = computed(() => locale.value === 'ar');

  const failedImages = ref(new Set<string>());

  const markImageFailed = (url: string) => {
    failedImages.value = new Set([...failedImages.value, url]);
  };

  const fileIcon = (kind: string) =>
    kind === 'pdf' ? 'pi pi-file-pdf' : kind === 'video' ? 'pi pi-video' : 'pi pi-file';

  const copyLink = async () => {
    if (!current.value?.url) return;

    try {
      await navigator.clipboard.writeText(current.value.url);

      toast.add({
        severity: 'success',
        summary: t('attachment_link_copied'),
        life: 3000,
      });
    } catch {
      toast.add({
        severity: 'error',
        summary: t('attachment_copy_failed'),
        life: 3000,
      });
    }
  };

  const previous = () => {
    activeIndex.value = Math.max(0, activeIndex.value - 1);
  };

  const next = () => {
    activeIndex.value = Math.min(attachments.value.length - 1, activeIndex.value + 1);
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (!visible.value) return;

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      isRtl.value ? next() : previous();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      isRtl.value ? previous() : next();
    }
  };

  watch(
    visible,
    (opened) =>
      opened
        ? window.addEventListener('keydown', onKeydown)
        : window.removeEventListener('keydown', onKeydown),
    { immediate: true },
  );

  onUnmounted(() => window.removeEventListener('keydown', onKeydown));
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    append-to="body"
    class="attachment-gallery-dialog"
    :closable="false"
    :draggable="false"
    :dismissable-mask="true"
    :show-header="false"
    :close-on-escape="true"
    :aria-label="$t('preview_attachment')"
  >
    <div class="attachment-gallery" :dir="isRtl ? 'rtl' : 'ltr'">
      <header class="attachment-gallery__toolbar">
        <div class="attachment-gallery__identity">
          <strong :title="current?.name">
            <bdi>{{ current?.name }}</bdi>
          </strong>

          <span dir="ltr"> {{ activeIndex + 1 }} / {{ attachments.length }} </span>
        </div>

        <div class="attachment-gallery__tools">
          <Button
            icon="pi pi-copy"
            :label="$t('copy_link')"
            :aria-label="$t('copy_link')"
            text
            :disabled="!current?.url"
            @click="copyLink"
          />

          <a
            v-if="current?.url"
            :href="current.url"
            :download="current.name || ''"
            class="p-button p-component p-button-text"
            :aria-label="$t('download_attachment')"
          >
            <span class="p-button-icon pi pi-download"></span>
            <span class="p-button-label">
              {{ $t('download') }}
            </span>
          </a>

          <Button
            icon="pi pi-times"
            :aria-label="$t('close')"
            :title="$t('close')"
            text
            @click="attachmentGallery.close()"
          />
        </div>
      </header>

      <Galleria
        v-model:active-index="activeIndex"
        :value="attachments"
        :show-thumbnails="attachments.length > 1 && attachments.length <= 7"
        :num-visible="Math.min(attachments.length, 7)"
        :show-item-navigators="false"
        :show-thumbnail-navigators="false"
      >
        <template #item="slotProps">
          <div class="attachment-gallery__stage">
            <img
              v-if="
                attachmentKind(slotProps.item) === 'image' &&
                slotProps.item.url &&
                !failedImages.has(slotProps.item.url)
              "
              :src="slotProps.item.url"
              :alt="slotProps.item.name"
              @error="markImageFailed(slotProps.item.url)"
            />

            <iframe
              v-else-if="attachmentKind(slotProps.item) === 'pdf' && slotProps.item.url"
              :src="slotProps.item.url"
              :title="slotProps.item.name"
            />

            <video
              v-else-if="attachmentKind(slotProps.item) === 'video' && slotProps.item.url"
              :src="slotProps.item.url"
              :aria-label="slotProps.item.name"
              controls
              preload="metadata"
            />

            <div v-else class="attachment-gallery__fallback">
              <i :class="fileIcon(attachmentKind(slotProps.item))" aria-hidden="true" />

              <strong>
                <bdi>{{ slotProps.item.name }}</bdi>
              </strong>

              <span>
                {{
                  attachmentExtension(slotProps.item.name, slotProps.item.url).toUpperCase() ||
                  $t('attachments')
                }}
              </span>

              <p>{{ $t('preview_not_available') }}</p>
            </div>
          </div>
        </template>

        <template #thumbnail="slotProps">
          <div class="attachment-gallery__thumbnail" :title="slotProps.item.name">
            <img
              v-if="
                attachmentKind(slotProps.item) === 'image' &&
                slotProps.item.url &&
                !failedImages.has(slotProps.item.url)
              "
              :src="slotProps.item.url"
              :alt="slotProps.item.name"
              @error="markImageFailed(slotProps.item.url)"
            />

            <i v-else :class="fileIcon(attachmentKind(slotProps.item))" aria-hidden="true" />
          </div>
        </template>
      </Galleria>

      <nav
        v-if="attachments.length > 1"
        class="attachment-gallery__navigation"
        :aria-label="$t('attachments')"
      >
        <Button
          :icon="isRtl ? 'pi pi-chevron-right' : 'pi pi-chevron-left'"
          :label="$t('previous')"
          :disabled="activeIndex === 0"
          :aria-label="$t('previous')"
          @click="previous"
        />

        <Button
          :icon="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'"
          :label="$t('next')"
          :disabled="activeIndex === attachments.length - 1"
          :aria-label="$t('next')"
          @click="next"
        />
      </nav>
    </div>
  </Dialog>
</template>

<style lang="scss">
  .attachment-gallery-dialog.p-dialog {
    width: min(100vw, 1440px);
    height: min(100dvh, 900px);
    max-height: 100dvh;
    margin: 0;
    border-radius: var(--radius-md);
    background: var(--quote-graphite-deep, var(--p-surface-900));
    overflow: hidden;
  }

  .attachment-gallery-dialog .p-dialog-content {
    height: 100%;
    padding: 0;
    background: transparent;
  }

  .attachment-gallery {
    display: flex;
    flex-direction: column;
    height: 100%;
    color: var(--quote-graphite-text, var(--p-surface-0));
  }

  .attachment-gallery__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-height: 72px;
    padding: 0.75rem 1.25rem;
    border-block-end: 1px solid var(--quote-graphite-line, var(--p-surface-700));
  }

  .attachment-gallery__identity {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
  }

  .attachment-gallery__identity strong {
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: none;
    white-space: nowrap;
  }

  .attachment-gallery__identity span {
    color: var(--quote-graphite-muted, var(--p-surface-400));
    font-size: 0.875rem;
  }

  .attachment-gallery__tools {
    display: flex;
    align-items: center;
    flex: none;
    gap: 0.25rem;
  }

  .attachment-gallery__tools .p-button {
    color: inherit;
  }

  /* Make the <a download> look exactly like PrimeVue text buttons */
  .attachment-gallery__tools a.p-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--p-button-gap, 0.5rem);
    color: inherit;
    text-decoration: none;
    cursor: pointer;
  }

  .attachment-gallery > .p-galleria {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  .attachment-gallery > .p-galleria .p-galleria-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  .attachment-gallery > .p-galleria .p-galleria-items-container {
    flex: 1;
    min-height: 0;
  }

  .attachment-gallery > .p-galleria .p-galleria-item-container,
  .attachment-gallery > .p-galleria .p-galleria-item {
    height: 100%;
    min-height: 0;
  }

  .attachment-gallery__stage {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 0;
    padding: 1rem;
    background: var(--quote-graphite-deep, var(--p-surface-900));
  }

  .attachment-gallery__stage > img,
  .attachment-gallery__stage > video {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .attachment-gallery__stage > iframe {
    width: 100%;
    height: 100%;
    border: 0;
    background: var(--p-surface-0);
  }

  .attachment-gallery__fallback {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.7rem;
    max-width: 100%;
    text-align: center;
  }

  .attachment-gallery__fallback i {
    font-size: 4rem;
    color: var(--quote-copper-bright, var(--p-primary-color));
  }

  .attachment-gallery__fallback strong {
    max-width: 100%;
    overflow-wrap: anywhere;
  }

  .attachment-gallery__fallback p {
    color: var(--quote-graphite-muted, var(--p-surface-400));
  }

  .attachment-gallery__thumbnail {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 54px;
    height: 54px;
    overflow: hidden;
  }

  .attachment-gallery__thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .attachment-gallery__thumbnail i {
    font-size: 1.5rem;
  }

  .attachment-gallery > .p-galleria .p-galleria-thumbnails,
  .attachment-gallery > .p-galleria .p-galleria-thumbnails-content {
    flex: 0 0 auto;
    background: var(--quote-graphite, var(--p-surface-800));
    color: var(--quote-graphite-text, var(--p-surface-0));
  }

  .attachment-gallery > .p-galleria .p-galleria-thumbnails-viewport {
    max-width: 560px;
    margin-inline: auto;
  }

  .attachment-gallery > .p-galleria .p-galleria-thumbnail-items {
    justify-content: center;
  }

  .attachment-gallery > .p-galleria .p-galleria-thumbnail-item {
    max-width: 80px;
  }

  .attachment-gallery > .p-galleria [data-p-galleria-thumbnail-item-current='true'] {
    outline: 2px solid var(--quote-copper-bright, var(--p-primary-color));
    outline-offset: -2px;
  }

  .attachment-gallery__navigation {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 1.25rem;
    border-block-start: 1px solid var(--quote-graphite-line, var(--p-surface-700));
  }

  .attachment-gallery__navigation .p-button {
    background: var(--quote-graphite-raised, var(--p-surface-700));
    border-color: transparent;
  }

  @media (max-width: 640px) {
    .attachment-gallery-dialog.p-dialog {
      width: 100vw;
      height: 100dvh;
      border-radius: 0;
    }

    .attachment-gallery__toolbar {
      padding: 0.5rem;
      gap: 0.25rem;
    }

    .attachment-gallery__tools .p-button-label {
      display: none;
    }

    .attachment-gallery__tools .p-button {
      width: 2.5rem;
    }

    .attachment-gallery__tools a.p-button {
      width: 2.5rem;
      min-width: 2.5rem;
      padding-inline: 0;
    }

    .attachment-gallery__navigation {
      padding: 0.5rem;
    }

    .attachment-gallery__navigation .p-button {
      min-width: 0;
    }
  }
</style>
