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
    <div class="dialog-content">
      <p class="dialog-message">{{ message }}</p>
      <button class="dialog-close-btn" @click="closeDialog">Close</button>
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
    background: var(--bg-main);
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    max-width: 400px;
    width: 90%;
  }

  .dialog-message {
    margin-bottom: 20px;
    font-size: 16px;
    color: var(--gray-900) !important;
  }

  .dialog-close-btn {
    background: var(--PrimaryColor);
    color: var(--BgWhite);
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }

  .dialog-close-btn:hover {
    background: var(--PrimaryColor-dark);
  }
</style>
