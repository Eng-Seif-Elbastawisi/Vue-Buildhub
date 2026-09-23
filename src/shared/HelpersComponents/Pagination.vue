<script lang="ts" setup>
  import IconArrowDown from '@/shared/icons/IconArrowDown.vue';

  import Popover from 'primevue/popover';
  import { computed, ref } from 'vue';

  interface PaginationDisplay {
    current?: number | null;
    currentPage?: number;
    last?: number | null;
    lastPage?: number;
    from?: number;
    to?: number;
    total: number;
    count?: number | null;
    perPage?: number;
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
      showSinglePage?: boolean;
    }>(),
    { showPageSize: true, showSinglePage: false },
  );

  const currentPage = computed(
    () => props.pagination?.currentPage ?? props.pagination?.current ?? 1,
  );
  const lastPage = computed(() => props.pagination?.lastPage ?? props.pagination?.last ?? 1);
  const perPage = computed(() => props.pagination?.perPage ?? props.pagination?.count ?? 10);
  const firstResult = computed(() => {
    if (!props.pagination?.total) return 0;
    return props.pagination.from ?? (currentPage.value - 1) * perPage.value + 1;
  });
  const lastResult = computed(
    () =>
      props.pagination?.to ??
      Math.min(currentPage.value * perPage.value, props.pagination?.total ?? 0),
  );
  const shouldShow = computed(
    () =>
      !!props.pagination &&
      (lastPage.value > 1 || (props.showSinglePage && props.pagination.total > 0)),
  );

  const numberOfPages = computed(() => {
    return Array.from({ length: lastPage.value }, (_, i) => i + 1);
  });
</script>

<template>
  <div v-if="shouldShow" class="pagination-wrapper">
    <span class="show-results">
      {{ $t('show') }} {{ firstResult }} {{ $t('to') }} {{ lastResult }}
      {{ $t('of') }}
      {{ pagination?.total }}
    </span>

    <div class="pagination">
      <button
        class="pagination-btn"
        type="button"
        :disabled="currentPage <= 1"
        @click="emit('changePage', currentPage > 1 ? currentPage - 1 : 1)"
      >
        {{ $t('prev') }}
      </button>
      <span
        v-for="item in numberOfPages.slice(currentPage > 2 ? currentPage - 2 : 0, currentPage + 2)"
        :key="item"
        :class="['pagination-item', { active: item === currentPage }]"
        :aria-current="item === currentPage ? 'page' : undefined"
        role="button"
        tabindex="0"
        @click="emit('changePage', item)"
        @keydown.enter="emit('changePage', item)"
        @keydown.space.prevent="emit('changePage', item)"
      >
        {{ item }}
      </span>
      <button
        class="pagination-btn"
        type="button"
        :disabled="currentPage >= lastPage"
        @click="emit('changePage', currentPage < lastPage ? currentPage + 1 : lastPage)"
      >
        {{ $t('next') }}
      </button>
    </div>

    <div v-if="showPageSize" class="count-per-page">
      <span>{{ $t('show') }}</span>
      <button class="pagination-btn" type="button" @click="toggle">
        {{ perPage }} <span><IconArrowDown /></span>
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
