<script setup lang="ts">
  import NewBranchIcon from '@/shared/icons/NewBranchIcon.vue';
  import { ref, computed, watch, nextTick } from 'vue';
  import Dialog from 'primevue/dialog';
  import MultiLangInput from '@/shared/MultiLangInput.vue';

  const props = defineProps<{
    visible: boolean;
    level: number;
    branchName: string;
    branchId?: number;
  }>();

  const emit = defineEmits<{
    (e: 'update:visible', val: boolean): void;
    (e: 'confirm', data: { name: Record<string, string>; level: number; branchId?: number }): void;
  }>();

  const inputValue = ref<Record<string, string>>({});
  const inputRef = ref<HTMLInputElement | null>(null);

  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val),
  });

  watch(dialogVisible, async (val) => {
    if (val) {
      inputValue.value = {};
      await nextTick();
      inputRef.value?.focus();
    }
  });

  const isInputEmpty = computed(() => {
    return (
      !inputValue.value || Object.values(inputValue.value).every((val) => !val || val.trim() === '')
    );
  });

  function handleConfirm() {
    if (isInputEmpty.value) return;
    emit('confirm', {
      name: inputValue.value,
      level: props.level,
      branchId: props.branchId,
    });
    inputValue.value = {};
  }
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :style="{ width: '30rem' }"
    :pt="{
      root: 'add-branch-dialog',
      header: 'dialog-header',
      content: 'dialog-body',
    }"
  >
    <template #header>
      <div class="dialog-icon">
        <NewBranchIcon />
      </div>
      <div class="dialog-header-text">
        <h3 class="dialog-title">{{ $t('add_a_new') + $t(branchName) }}</h3>
        <p class="dialog-subtitle">{{ $t('enter_your_preferred_branch_name_within_the_tree') }}</p>
      </div>
    </template>

    <!-- <label class="field-label" :for="`branch-input-${level}`">{{ $t('branch_name') }}</label>
    <input
      :id="`branch-input-${level}`"
      ref="inputRef"
      v-model="inputValue"
      type="text"
      :placeholder="$t('enter_branch_name')"
      class="field-input"
      @keydown.enter="handleConfirm"
      @keydown.esc="dialogVisible = false"
    /> -->

    <MultiLangInput
      ref="inputRef"
      :field-key="`title`"
      :label="$t(`title`)"
      :languages="['en', 'ar']"
      :model-value="inputValue"
      :type="`title`"
      @update:model-value="inputValue = $event"
      @keydown.enter="handleConfirm"
      @keydown.esc="dialogVisible = false"
    />

    <div class="dialog-footer">
      <button class="btn btn-primary" :disabled="isInputEmpty" @click="handleConfirm">
        {{ $t('add') }}
      </button>
      <button class="btn btn-secondary" @click="dialogVisible = false">{{ $t('cancel') }}</button>
    </div>
  </Dialog>
</template>

<style scoped>
  .field-input {
    background-color: var(--bg-main);
    border-radius: 30px;
    margin-bottom: 1rem;

    ::placeholder {
      color: var(--bread-crumb-color-span);
    }
  }
</style>
