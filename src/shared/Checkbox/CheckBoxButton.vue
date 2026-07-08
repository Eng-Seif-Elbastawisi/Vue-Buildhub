<script setup lang="ts">
  import { ref } from 'vue';
  import Checkbox from 'primevue/checkbox';
  import CheckBoxImg from '@/assets/images/CheckBoxImg.png';

  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';

  const emit = defineEmits(['update:checked']);
  const props = defineProps<{
    title: string;
    img?: string;
    checked?: boolean;
    helpTitle?: string;
    helpText?: string;
    helpExamples?: string[];
    showHelp?: boolean;
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
    <FieldHelpIcon
      :label="title"
      :field-name="title"
      :help-title="helpTitle"
      :help-text="helpText"
      :help-examples="helpExamples"
      :show-help="showHelp"
    />
    <Checkbox id="checkbox" v-model="ButtonValue" binary class="checkbox" @change="UpdateData" />
  </div>
</template>
