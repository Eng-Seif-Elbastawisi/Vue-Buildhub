<script setup lang="ts">
  import { ref, computed } from 'vue';
  import Popover from 'primevue/popover';
  import DropIcon from '@/shared/icons/DropIcon.vue';
  import wordSlice from '@/base/Presentation/Utils/word_slice';
  import { setDefaultImage } from '@/base/Presentation/Utils/set_default_image.ts';

  const op = ref();

  const props = defineProps<{
    data?: any[]; // locations array
    data_img?: { name: string; avatar: string }[];
  }>();

  // Only show each location's own title
  const locationTitles = computed(() => {
    if (!props.data || props.data.length === 0) return [];
    return props.data.map((loc) => loc.title || loc.name);
  });

  const toggle = (event: MouseEvent) => {
    op.value.toggle(event);
  };
</script>

<template>
  <!-- Text mode -->
  <div v-if="locationTitles.length > 0" class="popover-button" @click="toggle">
    <span v-if="locationTitles.length > 1" class="tag tag-more">
      {{ locationTitles.length - 1 }}
    </span>
    <span class="tag tag-blue">
      {{ wordSlice(locationTitles.join(', '), 10) }}
    </span>
    <DropIcon class="drop-icon" />
  </div>

  <!-- Image mode -->
  <div v-else-if="data_img?.length" class="popover-button" @click="toggle">
    <img
      v-for="(supervisor, idx) in data_img.slice(0, 3)"
      :key="idx"
      :src="supervisor.avatar || '/default-avatar.png'"
      :alt="supervisor.name"
      class="avatar"
      @error="setDefaultImage"
    />
    <span v-if="data_img.length > 3" class="avatar-more"> +{{ data_img.length - 3 }} </span>
  </div>

  <!-- Popover -->
  <Popover ref="op">
    <div v-if="locationTitles.length > 0" class="popover-content">
      <p v-for="(title, index) in locationTitles" :key="index" class="name">
        {{ title }}
      </p>
    </div>

    <div v-else-if="data_img?.length" class="popover-content">
      <div v-for="(img, index) in data_img" :key="index" class="img-container">
        <img class="name" :src="img.avatar || '/default-avatar.png'" @error="setDefaultImage" />
        <p>{{ img.name }}</p>
      </div>
    </div>
  </Popover>
</template>
