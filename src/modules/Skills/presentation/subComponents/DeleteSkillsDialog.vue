<script lang="ts" setup>
  import { ref } from 'vue';
  import Dialog from 'primevue/dialog';
  import DeleteIcon from '@/shared/icons/DeleteDialogIcons/DeleteIcon.vue';
  const visible = ref(false);
  const emits = defineEmits(['delete']);

  const {
    title = 'delete',
    message = 'delete_message',
    hasbtn,
  } = defineProps<{
    title?: string;
    message?: string;
    hasbtn?: boolean;
  }>();
</script>

<template>
  <button v-if="hasbtn" @click="visible = true">
    <slot name="btn"> </slot>
  </button>
  <button v-else class="action-btn delete" @click="visible = true">
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  </button>
  <Dialog
    v-model:visible="visible"
    :modal="true"
    :pt="{
      root: 'delete-dialog',
      header: 'dialog-header',
      content: 'dialog-body',
    }"
    :style="{ width: '35rem' }"
  >
    <template #container>
      <DeleteIcon />

      <h4 class="dialog-title">{{ title }}</h4>
      <p class="dialog-message">{{ message }}</p>
      <div class="flex gap-2 items-center btns">
        <button
          class="btn btn-delete-danger"
          @click="
            emits('delete');
            visible = false;
          "
        >
          Yes, delete it
        </button>
        <button class="btn btn-third" @click="visible = false">cancel</button>
      </div>
    </template>
  </Dialog>
</template>
