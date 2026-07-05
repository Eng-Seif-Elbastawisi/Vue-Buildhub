<script setup lang="ts">
  import { ref } from 'vue';
  import Checkbox from 'primevue/checkbox';
  import CheckBoxImg from '@/assets/images/CheckBoxImg.png';

  const emit = defineEmits(['update:checked']);
  const props = defineProps<{
    title: string;
    img?: string;
    checked?: boolean;
  }>();
  const ButtonValue = ref(props.checked);

  const UpdateData = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit('update:checked', target.checked);
  };
</script>

<template>
  <div class="checkbox-button">
    <label for="checkbox" class="checkbox-data">
      <img :src="img || CheckBoxImg" :alt="$t('checkbox_icon_alt')" />
      <p class="title">{{ title }}</p>
    </label>
    <Checkbox id="checkbox" v-model="ButtonValue" binary class="checkbox" @change="UpdateData" />
  </div>
</template>
