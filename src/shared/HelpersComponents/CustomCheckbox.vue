<script setup lang="ts">
  import { ref, watch } from 'vue';

  const props = defineProps<{
    title: string;
    checked?: boolean;
  }>();
  const emit = defineEmits(['update:checked']);
  const CheckboxValue = ref(props.checked);
  const updateData = () => {
    emit('update:checked', CheckboxValue.value);
  };
  watch(
    () => props.checked,
    (val) => {
      CheckboxValue.value = val;
    },
    { immediate: true },
  );
</script>
<template>
  <div class="checkbox-toggle-wrapper">
    <input
      :id="title"
      v-model="CheckboxValue"
      type="checkbox"
      :value="1"
      class="checkbox-checkbox"
      @change="updateData"
    />
    <label :for="title" class="checkbox-label">
      <div class="toggle-background">
        <div class="toggle-slider">
          <svg
            class="icon checkbox-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
            <path d="M12 15v6m0 0l-2-2m2 2l2-2" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          <svg
            class="icon check-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>
      <div class="label-content">
        <span class="label-text">{{ $t(title) }}</span>
      </div>
    </label>
  </div>
</template>
