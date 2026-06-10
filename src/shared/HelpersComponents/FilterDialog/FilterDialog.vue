<script setup lang="ts">
  import { computed } from 'vue';
  import Dialog from 'primevue/dialog';
  import DialogIconFillter from '@/shared/icons/DialogIconFillter.vue';

  const props = defineProps<{
    modelValue: boolean;
  }>();

  const emit = defineEmits(['update:modelValue']);

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
  });
</script>

<template>
  <button class="btn fillter-button" @click="visible = true">
    {{ $t('Filter') }}
    <DialogIconFillter />
  </button>
  <Dialog
    v-model:visible="visible"
    modal
    :style="{ width: '25rem' }"
    :pt="{
      root: 'filter-dialog',
    }"
  >
    <template #header>
      <div class="filter-document">
        <h6 class="filter-title">{{ $t('filter_option') }}</h6>
      </div>
    </template>

    <div class="filter-content">
      <slot name="content"></slot>
    </div>
  </Dialog>
</template>
