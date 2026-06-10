<script setup lang="ts">
  import { ref, watch } from 'vue';
  import RadioButton from 'primevue/radiobutton';
  import Checkbox from 'primevue/checkbox';

  const SelectedOption = ref();
  const customize = ref();
  const emit = defineEmits(['update:value', 'update:Customize']);

  defineProps<{
    title: string;
    selections?: string[];
    images_selections?: string[];
    Customize?: boolean;
  }>();

  const UpdateSelect = (data: Event) => {
    const target = data.target as HTMLInputElement;
    SelectedOption.value = target.value;
    emit('update:value', target.value);
  };

  watch(customize, (newVal) => {
    if (customize.value) {
      SelectedOption.value = '';
    }
    emit('update:Customize', newVal);
  });
</script>

<template>
  <div class="radio-selection-containre">
    <div class="radio-selection-header">
      <p class="title">{{ title }}</p>
      <div v-if="Customize" class="checkbox-header">
        <!-- <input type="checkbox" v-model="customize" :id="title.split(' ').join('-')"
          :name="title.split(' ').join('-')" /> -->
        <Checkbox
          :id="title.split(' ').join('-')"
          v-model="customize"
          :name="title.split(' ').join('-')"
          binary
        />
        <label
          class="checkbox-label"
          :for="title.split(' ').join('-')"
          @click="customize = !customize"
          >customize</label
        >
      </div>
    </div>

    <div v-if="selections && selections.length > 0" class="selection-container">
      <div
        v-for="(select, index) in selections"
        :key="index"
        class="selection"
        :class="[SelectedOption == select ? 'selected' : '', customize ? 'disabled' : '']"
      >
        <!-- <input type="radio" :name="title.split(' ').join('-')" :id="`${title.split(' ').join('-')}-${select}`"
          :value="select" v-model="SelectedOption" @change="UpdateSelect"> -->
        <RadioButton
          v-model="SelectedOption"
          :input-id="`${title.split(' ').join('-')}-${select}`"
          :name="title.split(' ').join('-')"
          :value="select"
          @change="UpdateSelect"
        />

        <label :for="`${title.split(' ').join('-')}-${select}`">{{ select }}</label>
      </div>
    </div>

    <div
      v-else-if="images_selections && images_selections.length > 0"
      class="selection-container selection-image-container"
    >
      <div
        v-for="(img, index) in images_selections"
        :key="index"
        class="selection"
        :class="SelectedOption == index + 1 ? 'selected' : ''"
      >
        <input
          :id="`${title.split(' ').join('-')}-img-${index}`"
          v-model="SelectedOption"
          type="radio"
          :name="title.split(' ').join('-')"
          :value="index + 1"
          @change="UpdateSelect"
        />
        <label :for="`${title.split(' ').join('-')}-img-${index}`">
          <img :src="img" :alt="`${title}-option-${index}`" />
        </label>
      </div>
    </div>
  </div>
</template>
