<script setup lang="ts">
  import Dialog from 'primevue/dialog';
  import { ref } from 'vue';
  import Galleria from 'primevue/galleria';
  // import HeaderSection from '@/features/Organization/Project/Presentation/components/Details/DetailsHeader/HeaderSection.vue';

  const { images } = defineProps<{ images: string[] }>();

  const visible = ref(false);

  const responsiveOptions = ref([
    {
      breakpoint: '1300px',
      numVisible: 4,
    },
    {
      breakpoint: '575px',
      numVisible: 1,
    },
  ]);
</script>

<template>
  <div class="card flex justify-center">
    <button type="button" @click="visible = true">
      <slot />
    </button>
    <Dialog v-model:visible="visible" modal maximizable dismissable-mask :style="{ width: '70vw' }">
      <template #header>
        <!-- <HeaderSection
          :img="''"
          :title="'All photos (10)'"
          :subtitle="'you can add more or delete photo'"
        /> -->
      </template>
      <Galleria
        :value="images"
        :responsive-options="responsiveOptions"
        :num-visible="5"
        :circular="true"
        container-style="max-width: 100%"
        :show-item-navigators="false"
        :show-thumbnails="false"
        :show-item-navigators-on-hover="false"
        :show-indicators="true"
      >
        <template #item="slotProps">
          <img
            :src="slotProps.item"
            :alt="'image'"
            style="width: 100%; height: 40rem; object-fit: contain"
          />
        </template>
        <template #thumbnail="slotProps">
          <img :src="slotProps.item" :alt="'image'" style="display: block" />
        </template>
      </Galleria>
    </Dialog>
  </div>
</template>
