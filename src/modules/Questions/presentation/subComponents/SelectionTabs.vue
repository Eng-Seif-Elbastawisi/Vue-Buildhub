<script setup lang="ts">
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import RadioButton from 'primevue/radiobutton';

  import { ref, watch } from 'vue';
  const emit = defineEmits(['update:modelValue']);
  const props = defineProps<{
    tabs: TitleInterface<number>[];
    selectedTab?: number | null;
  }>();

  const selectedTab = ref<number | null>(props.selectedTab || null);
  const selectTab = (id: number) => {
    selectedTab.value = id;
    emit('update:modelValue', id);
  };

  watch(
    () => props.selectedTab,
    (newSelectedTab) => {
      selectedTab.value = newSelectedTab!;
      emit('update:modelValue', newSelectedTab);
    },
    { deep: true },
  );
</script>

<template>
  <div class="all_tabs">
    <div
      v-for="item in tabs"
      :key="item.id"
      class="tab-item"
      :class="{ active: selectedTab === item.id }"
      @click="selectTab(item.id)"
    >
      <RadioButton v-model="selectedTab" :input-id="String(item.id)" name="tab" :value="item.id" />
      <label>{{ $t(item.title!) }}</label>
    </div>
  </div>
</template>
