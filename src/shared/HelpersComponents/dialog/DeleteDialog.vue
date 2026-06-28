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
  <Dialog v-model:visible="visible" modal :header="$t('delete_dialog')" :style="{ width: '25rem' }">
    <h1>{{ $t('delete_item_confirmation') }}</h1>
    <div class="dialogs-btn-container">
      <button @click="Cancel">{{ $t('cancel') }}</button>
      <button @click="Delete">{{ $t('Delete') }}</button>
    </div>
  </Dialog>
</template>

<style scoped>
  .dialogs-btn-container {
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }

  button {
    padding: 8px 16px;
    background-color: var(--PrimaryColor);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 12px;
    width: 50%;
  }

  button:hover {
    background-color: var(--PrimaryColor-dark);
  }
</style>
