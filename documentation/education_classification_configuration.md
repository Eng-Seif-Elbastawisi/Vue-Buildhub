<script setup lang="ts">
  import NewBranchIcon from '@/shared/icons/NewBranchIcon.vue';
  import { ref } from 'vue';
  import Dialog from 'primevue/dialog';

  const { level } = defineProps<{
    level: number;
  }>();

  const emit = defineEmits<{
    (e: 'update:visible', val: boolean): void;
    (e: 'confirm', name: string): void;
  }>();

  const inputValue = ref('');

  function handleConfirm() {
    const name = inputValue.value.trim();
    if (!name) return;
    emit('confirm', name);
    inputValue.value = '';
  }
  const visible = ref(false);
</script>

<template>
  <button @click="visible = true">Open Dialog</button>
  <Dialog
    v-model:visible="visible"
    modal
    :style="{ width: '25rem' }"
    :pt="{
      root: 'add-branch-dialog',
      header: 'dialog-header',
      content: 'dialog-body',
      footer: 'dialog-footer',
    }"
  >
    <template #header>
      <div class="dialog-icon">
        <NewBranchIcon />
      </div>
      <div>
        <h3 :id="`branch-dialog-title`" class="dialog-title">Add A New Branch{{ level }}</h3>
        <p class="dialog-subtitle">Enter Your Preferred Branch{{ level }} Name Within The Tree</p>
      </div>
    </template>

    <div class="dialog-body">
      <label class="field-label" :for="`branch-input-${level}`">Branch{{ level }} Name</label>
      <input
        :id="`branch-input-${level}`"
        ref="inputRef"
        v-model="inputValue"
        type="text"
        :placeholder="`Enter Branch${level} Name`"
        class="field-input"
        @keydown.enter="handleConfirm"
        @keydown.esc="$emit('update:visible', false)"
      />

      <div class="dialog-footer">
        <button class="btn-confirm" :disabled="!inputValue.trim()" @click="handleConfirm">
          Add
        </button>
        <button class="btn-cancel" @click="$emit('update:visible', false)">Cancel</button>
      </div>
    </div>
  </Dialog>
</template>

