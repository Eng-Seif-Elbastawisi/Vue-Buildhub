<script setup lang="ts">
  import UnifiedDialog from '@/base/Presentation/Dialogs/UnifiedDialog.vue';
  import ToastContainer from '@/base/Presentation/Dialogs/ToastContainer.vue';
  import { useThemeStore } from '@/stores/theme';
  import Toast from 'primevue/toast';
  import AttachmentGallery from '@/shared/AttachmentGallery/AttachmentGallery.vue';
  import AppToast from '@/shared/ConstructionStates/AppToast.vue';

  // Initialise early so the `dark` class is applied before first paint
  useThemeStore();
</script>

<template>
  <div>
    <UnifiedDialog />
    <ToastContainer position="top-right" />
    <RouterView />
    <Toast class="app-prime-toast">
      <template #message="slotProps">
        <AppToast
          :type="
            slotProps.message.severity === 'success'
              ? 'success'
              : slotProps.message.severity === 'error'
                ? 'error'
                : slotProps.message.severity === 'warn'
                  ? 'warning'
                  : 'info'
          "
          :title="slotProps.message.summary"
          :message="slotProps.message.detail || ''"
        />
      </template>
    </Toast>
    <AttachmentGallery />
  </div>
</template>

<style scoped>
  :deep(.app-prime-toast .p-toast-message) {
    background: var(--bg-card);
    border: 0;
    border-radius: 12px;
    box-shadow: var(--shadow-lg);
    color: var(--gray-900);
  }

  :deep(.app-prime-toast .p-toast-message-content) {
    align-items: center;
  }

  @media (max-width: 620px) {
    :deep(.app-prime-toast) {
      width: min(25rem, calc(100vw - 2rem));
    }
  }

  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }

  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }

  .logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
  }
</style>
