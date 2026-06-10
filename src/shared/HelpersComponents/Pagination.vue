<script lang="ts" setup>
  // import type PaginationModel from '@/base/Core/Models/pagination_model';
  import IconArrowDown from '@/shared/icons/IconArrowDown.vue';

  import Popover from 'primevue/popover';
  import { computed, ref } from 'vue';

  const emit = defineEmits(['changePage', 'countPerPage']);

  const op = ref();
  const toggle = (event: Event) => {
    op.value.toggle(event);
  };
  const props = defineProps<{
    pagination: any | null;
  }>();

  const numberOfPages = computed(() => {
    return Array.from({ length: props.pagination?.last || 0 }, (_, i) => i + 1);
  });
</script>

<template>
  <div v-if="pagination?.last > 1" class="pagination-wrapper">
    <span class="show-results">
      show {{ pagination?.current }} to {{ pagination?.next }} of
      {{ pagination?.total }}
    </span>

    <div class="pagination">
      <button
        class="pagination-btn"
        @click="emit('changePage', pagination?.current! > 1 ? pagination?.current! - 1 : 1)"
      >
        Prev
      </button>
      <span
        v-for="item in numberOfPages.slice(
          pagination?.current! > 2 ? pagination?.current! - 2 : 0,
          pagination?.current! + 2,
        )"
        :key="item"
        :class="['pagination-item', { active: item === pagination?.current }]"
        @click="emit('changePage', item)"
      >
        {{ item }}
      </span>
      <button
        class="pagination-btn"
        @click="
          emit(
            'changePage',
            pagination?.current! < pagination?.last! ? pagination?.current! + 1 : pagination?.last!,
          )
        "
      >
        Next
      </button>
    </div>

    <div class="count-per-page">
      <span> Show </span>
      <button class="pagination-btn" @click="toggle">
        {{ pagination?.count }} <span><IconArrowDown /></span>
      </button>
      <Popover ref="op">
        <div class="per-page">
          <span @click="emit('countPerPage', 10)">10</span>
          <span @click="emit('countPerPage', 20)">20</span>
          <span @click="emit('countPerPage', 30)">30</span>
        </div>
      </Popover>
      <span> per page </span>
    </div>
  </div>
</template>

<style scoped></style>
