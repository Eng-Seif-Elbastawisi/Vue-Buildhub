<script setup lang="ts">
  import Dialog from 'primevue/dialog';
  import { ref } from 'vue';

  const visible = ref(false);
  const emit = defineEmits(['cancel', 'delete']);
  const Cancel = () => {
    visible.value = false;
    emit('cancel');
  };

  const Delete = () => {
    visible.value = false;
    emit('delete');
  };
</script>

<template>
  <div @click="visible = true">
    <slot name="Dialog" />
  </div>
  <Dialog
    v-model:visible="visible"
    class="workspace-dialog workspace-dialog--small"
    modal
    :header="$t('delete_dialog')"
    :style="{ width: '25rem' }"
  >
    <p class="delete-confirmation">{{ $t('delete_item_confirmation') }}</p>
    <div class="dialogs-btn-container">
      <button type="button" class="btn btn-secondary" @click="Cancel">{{ $t('cancel') }}</button>
      <button type="button" class="btn btn-danger" @click="Delete">{{ $t('Delete') }}</button>
    </div>
  </Dialog>
</template>

<style scoped>
  .delete-confirmation {
    margin: 0 0 var(--bh-space-6);
    color: var(--bh-text);
    font-size: var(--bh-text-md);
    line-height: 1.6;
  }

  .dialogs-btn-container {
    display: flex;
    justify-content: flex-end;
    gap: var(--bh-space-3);
  }
</style>
