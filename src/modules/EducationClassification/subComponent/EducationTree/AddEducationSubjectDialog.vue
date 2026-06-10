<script setup lang="ts">
  import { ref, computed, watch, nextTick } from 'vue';
  import Dialog from 'primevue/dialog';
  import NewBranchIcon from '@/shared/icons/NewBranchIcon.vue';
  import MultiLangInput from '@/shared/MultiLangInput.vue';

  const props = defineProps<{ visible: boolean }>();
  const emit = defineEmits<{
    (e: 'update:visible', val: boolean): void;
    (e: 'confirm', name: Record<string, string>): void;
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

  function handleConfirm() {
    const name = inputValue.value;
    if (!name) return;
    emit('confirm', name);
    inputValue.value = {};
  }
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :style="{ width: '35rem' }"
    :pt="{
      root: 'add-education-type-dialog',
      header: 'dialog-header',
      content: 'dialog-body',
    }"
  >
    <template #header>
      <div class="dialog-icon">
        <NewBranchIcon />
      </div>
      <div>
        <h3 class="dialog-title">{{ $t('add_a_new_subject') }}</h3>
        <p class="dialog-subtitle">{{ $t('confirm_the_name_of_the_new_subject') }}</p>
      </div>
    </template>

    <!-- <label class="field-label" for="edu-type-input">{{ $t('subject_name') }}</label> -->
    <!-- <input
      id="edu-type-input"
      ref="inputRef"
      v-model="inputValue"
      type="text"
      :placeholder="$t('enter_subject_name')"
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
      <button class="btn btn-primary" :disabled="!inputValue" @click="handleConfirm">
        {{ $t('add') }}
      </button>
      <button class="btn btn-secondary" @click="dialogVisible = false">{{ $t('cancel') }}</button>
    </div>
  </Dialog>
</template>
