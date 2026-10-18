<script>
  import ValidationDialog from '@/base/Presentation/Utils/validationService';
  import { computed } from 'vue';

  export default {
    setup() {
      // Reactive bindings to the ValidationDialog service
      const isOpen = computed(() => ValidationDialog.isOpen.value);
      const message = computed(() => ValidationDialog.message.value);

      const openDialog = () => {
        ValidationDialog.openDialog('This is a validation message.');
      };

      const closeDialog = () => {
        ValidationDialog.clearValidation();
      };

      return {
        isOpen,
        message,
        openDialog,
        closeDialog,
      };
    },
  };
</script>

<template>
  <div v-if="isOpen" class="dialog-overlay" @click.self="closeDialog">
    <div
      class="dialog-content"
      role="alertdialog"
      aria-modal="true"
      aria-describedby="validation-dialog-message"
      :aria-label="$t('dialog.error_title')"
    >
      <p id="validation-dialog-message" class="dialog-message">{{ message }}</p>
      <button type="button" class="dialog-close-btn" @click="closeDialog">{{ $t('close') }}</button>
    </div>
  </div>
</template>

<style scoped>
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--overlay-bg);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .dialog-content {
    background: var(--bh-surface-raised);
    padding: var(--bh-space-6);
    border-radius: var(--bh-radius-card);
    text-align: center;
    max-width: 400px;
    width: 90%;
  }

  .dialog-message {
    margin-bottom: 20px;
    font-size: 16px;
    color: var(--bh-text);
  }

  .dialog-close-btn {
    background: var(--PrimaryColor);
    color: var(--button-primary-color);
    padding: 10px 20px;
    border: none;
    border-radius: var(--bh-radius-pill);
    cursor: pointer;
    font-size: 14px;
  }

  .dialog-close-btn:hover {
    background: var(--SecondaryColor);
  }
</style>
