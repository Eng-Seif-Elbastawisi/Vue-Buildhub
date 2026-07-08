<script setup lang="ts">
  import { ref, watch } from 'vue';

  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';

  // Props
  const props = defineProps<{
    modelValue: { title: string; img?: string }[];
    withImage?: boolean;
  }>();

  // Emit
  const emit = defineEmits<{
    (e: 'update:modelValue', value: { title: string; img?: string }[]): void;
  }>();

  // Local copy of inputs
  const inputs = ref([...props.modelValue]);

  // Sync when parent updates
  watch(
    () => props.modelValue,
    (newVal) => {
      inputs.value = [...newVal];
    },
    { deep: true },
  );

  // Sync back to parent
  watch(
    inputs,
    (newVal) => {
      emit('update:modelValue', newVal);
    },
    { deep: true },
  );
</script>

<template>
  <div class="inputs-container">
    <div v-for="(_, i) in inputs" :key="i" class="input-wrapper">
      <span class="field-help-label-row field-help-label-row--block">
        <label for="">{{ $t('Title') }}</label>
        <FieldHelpIcon :label="$t('Title')" field-name="title" />
      </span>
      <input v-model="inputs[i]!.title" type="text" :placeholder="$t('Enter Title')" />
    </div>
  </div>
</template>
