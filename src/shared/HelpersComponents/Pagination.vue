<script lang="ts" setup>
  import IconArrowDown from '@/shared/icons/IconArrowDown.vue';

  import Popover from 'primevue/popover';
  import { computed, ref } from 'vue';

  interface PaginationDisplay {
    current: number | null;
    last: number | null;
    next: number | null;
    total: number;
    count: number | null;
  }

  const emit = defineEmits(['changePage', 'countPerPage']);

  const op = ref();
  const toggle = (event: Event) => {
    op.value.toggle(event);
  };
  const props = withDefaults(
    defineProps<{
      pagination: PaginationDisplay | null;
      showPageSize?: boolean;
    }>(),
    { showPageSize: true },
  );

  const numberOfPages = computed(() => {
    return Array.from({ length: props.pagination?.last || 0 }, (_, i) => i + 1);
  });
</script>

<template>
  <div v-if="pagination?.last > 1" class="pagination-wrapper">
    <span class="show-results">
      {{ $t('show') }} {{ pagination?.current }} {{ $t('to') }} {{ pagination?.next }}
      {{ $t('of') }}
      {{ pagination?.total }}
    </span>

    <div class="pagination">
      <button
        class="pagination-btn"
        @click="emit('changePage', pagination?.current! > 1 ? pagination?.current! - 1 : 1)"
      >
        {{ $t('prev') }}
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
        {{ $t('next') }}
      </button>
    </div>

    <div v-if="showPageSize" class="count-per-page">
      <span>{{ $t('show') }}</span>
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
      <span>{{ $t('per_page') }}</span>
    </div>
  </div>
</template>

<style scoped></style>
