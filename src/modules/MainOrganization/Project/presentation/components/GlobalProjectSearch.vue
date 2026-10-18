<script setup lang="ts">
  import Dialog from 'primevue/dialog';
  import Skeleton from 'primevue/skeleton';
  import { computed, nextTick, onBeforeUnmount, ref, shallowRef, useId, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRouter, type RouteLocationRaw } from 'vue-router';

  import { ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
  import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import { useUserStore } from '@/stores/user';

  import { getConvertStatusNameKey } from '../../core/constants/convert.status.enum';
  import type ProjectModel from '../../core/models/project.model';
  import IndexProjectParams from '../../core/params/index.project.params';
  import ProjectController from '../controllers/project.controller';

  defineOptions({ inheritAttrs: false });

  withDefaults(
    defineProps<{
      compact?: boolean;
    }>(),
    {
      compact: false,
    },
  );

  const MINIMUM_QUERY_LENGTH = 2;
  const SEARCH_DEBOUNCE_MS = 450;
  const SEARCH_RESULTS_PER_PAGE = 20;

  const { locale, t, te } = useI18n();
  const router = useRouter();
  const userStore = useUserStore();
  const projectController = ProjectController.getInstance();

  const query = ref('');
  const dialogVisible = ref(false);
  const loading = ref(false);
  const hasSearched = ref(false);
  const errorMessage = ref<string | null>(null);
  const results = shallowRef<ProjectModel[]>([]);
  const triggerInput = ref<HTMLInputElement | null>(null);
  const dialogInput = ref<HTMLInputElement | null>(null);
  const searchDialogId = useId();

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let activeRequest: AbortController | null = null;
  let requestSequence = 0;

  const keyword = computed(() => query.value.trim());
  const canSearch = computed(() => keyword.value.length >= MINIMUM_QUERY_LENGTH);

  const clearDebounce = (): void => {
    if (debounceTimer !== undefined) {
      clearTimeout(debounceTimer);
      debounceTimer = undefined;
    }
  };

  const cancelPendingRequest = (): void => {
    activeRequest?.abort();
    activeRequest = null;
  };

  const invalidatePendingSearch = (): void => {
    clearDebounce();
    cancelPendingRequest();
    requestSequence += 1;
    loading.value = false;
  };

  const resetSearchState = (): void => {
    results.value = [];
    errorMessage.value = null;
    hasSearched.value = false;
  };

  const focusDialogInput = async (): Promise<void> => {
    await nextTick();
    dialogInput.value?.focus();
  };

  const focusFirstProjectResult = async (): Promise<void> => {
    await nextTick();
    document
      .getElementById(searchDialogId)
      ?.querySelector<HTMLElement>('.project-search-card')
      ?.focus();
  };

  const searchErrorMessage = (errorKey?: string): string => {
    return errorKey && te(errorKey) ? t(errorKey) : t('project_search.error_message');
  };

  const showLoadingState = (): void => {
    loading.value = true;
    errorMessage.value = null;
    hasSearched.value = false;
  };

  const fetchProjectMatches = (
    searchKeyword: string,
    signal: AbortSignal,
  ): Promise<DataState<ProjectModel[]>> => {
    return projectController.searchProjects(
      new IndexProjectParams(searchKeyword, 1, SEARCH_RESULTS_PER_PAGE, 1, null, null),
      {
        signal,
        enableRetry: false,
        showErrorDialog: false,
      },
    );
  };

  const applySearchState = (searchState: DataState<ProjectModel[]>): void => {
    if (searchState.error?.type === ErrorType.dataEmpty) {
      results.value = [];
      return;
    }

    if (searchState.hasError) {
      results.value = [];
      errorMessage.value = searchErrorMessage(searchState.error?.displayMessage);
      return;
    }

    results.value = searchState.data ?? [];
  };

  const searchIsOutdated = (
    request: AbortController,
    searchSequence: number,
    searchKeyword: string,
  ): boolean => {
    return (
      request.signal.aborted ||
      searchSequence !== requestSequence ||
      searchKeyword !== keyword.value
    );
  };

  const executeSearch = async (searchKeyword: string): Promise<void> => {
    if (!dialogVisible.value || searchKeyword.length < MINIMUM_QUERY_LENGTH) return;

    clearDebounce();
    cancelPendingRequest();
    const request = new AbortController();
    const searchSequence = ++requestSequence;
    activeRequest = request;
    showLoadingState();

    const searchState = await fetchProjectMatches(searchKeyword, request.signal);
    if (searchIsOutdated(request, searchSequence, searchKeyword)) return;

    activeRequest = null;
    loading.value = false;
    hasSearched.value = true;
    if (searchState.error?.type !== ErrorType.cancelled) applySearchState(searchState);
  };

  const searchImmediately = (): void => {
    clearDebounce();
    if (canSearch.value) void executeSearch(keyword.value);
  };

  const scheduleDelayedSearch = (): void => {
    clearDebounce();
    if (!canSearch.value) return;

    debounceTimer = setTimeout(() => {
      debounceTimer = undefined;
      void executeSearch(keyword.value);
    }, SEARCH_DEBOUNCE_MS);
  };

  const openSearch = (): void => {
    dialogVisible.value = true;
    void focusDialogInput();

    if (canSearch.value && !loading.value && !hasSearched.value) {
      searchImmediately();
    }
  };

  const openSearchFromKeyboard = (): void => {
    if (!keyword.value) {
      return;
    }

    if (dialogVisible.value && results.value.length) {
      void focusFirstProjectResult();
      return;
    }

    openSearch();
  };

  const closeDialog = (): void => {
    dialogVisible.value = false;
    invalidatePendingSearch();
  };

  const updateDialogVisibility = (visible: boolean): void => {
    if (visible) {
      openSearch();
      return;
    }

    closeDialog();
  };

  const clearSearch = (): void => {
    invalidatePendingSearch();
    query.value = '';
    resetSearchState();
    dialogVisible.value = false;

    void nextTick(() => {
      triggerInput.value?.focus();
    });
  };

  const retrySearch = (): void => {
    searchImmediately();
  };

  const getProjectRoute = (projectId: number): RouteLocationRaw => {
    if (userStore.user?.isMaster) {
      return { path: `/admin/Project/show/${projectId}` };
    }

    return {
      name: 'show-project',
      params: { project_id: projectId },
    };
  };

  const viewProject = async (project: ProjectModel): Promise<void> => {
    if (project.id === undefined) {
      return;
    }

    dialogVisible.value = false;
    invalidatePendingSearch();
    await router.push(getProjectRoute(project.id));
  };

  const displayText = (text?: string): string => text?.trim() || '-';

  const formatCreationDate = (timestamp?: string): string => {
    if (!timestamp) {
      return '-';
    }

    const normalizedTimestamp = timestamp.includes(' ') ? timestamp.replace(' ', 'T') : timestamp;
    const creationDate = new Date(normalizedTimestamp);

    if (Number.isNaN(creationDate.getTime())) {
      return timestamp;
    }

    return new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-EG' : 'en-GB', {
      dateStyle: 'medium',
    }).format(creationDate);
  };

  watch(query, () => {
    invalidatePendingSearch();
    resetSearchState();

    if (!keyword.value) {
      dialogVisible.value = false;
      return;
    }

    dialogVisible.value = true;

    if (canSearch.value) {
      scheduleDelayedSearch();
    }
  });

  onBeforeUnmount(() => {
    invalidatePendingSearch();
  });
</script>

<template>
  <div
    v-bind="$attrs"
    class="global-project-search"
    :class="{ 'global-project-search--compact': compact }"
  >
    <button
      v-if="compact"
      type="button"
      class="global-project-search__compact-trigger"
      :aria-label="$t('project_search.open')"
      :aria-controls="searchDialogId"
      :title="$t('project_search.open')"
      @click="openSearch"
    >
      <i class="pi pi-search" aria-hidden="true"></i>
    </button>

    <label v-else class="global-project-search__field">
      <i class="pi pi-search" aria-hidden="true"></i>
      <span class="visually-hidden">{{ $t('project_search.placeholder') }}</span>
      <input
        ref="triggerInput"
        v-model="query"
        class="workspace-control"
        type="search"
        autocomplete="off"
        :placeholder="$t('project_search.placeholder')"
        :aria-label="$t('project_search.placeholder')"
        :aria-controls="searchDialogId"
        @keydown.enter.prevent="openSearchFromKeyboard"
        @keydown.esc.prevent="closeDialog"
      />
    </label>
  </div>

  <Dialog
    :id="searchDialogId"
    :visible="dialogVisible"
    modal
    dismissable-mask
    :draggable="false"
    :close-button-props="{ 'aria-label': t('close') }"
    class="project-search-dialog workspace-dialog"
    @show="focusDialogInput"
    @update:visible="updateDialogVisibility"
  >
    <template #header>
      <div class="project-search-dialog__heading">
        <span class="project-search-dialog__heading-icon" aria-hidden="true">
          <i class="pi pi-briefcase"></i>
        </span>
        <div>
          <h2>{{ $t('project_search.title') }}</h2>
          <p v-if="keyword">
            {{ $t('project_search.results_for', { keyword }) }}
          </p>
          <p v-else>{{ $t('project_search.description') }}</p>
        </div>
      </div>
    </template>

    <div class="project-search-dialog__search-field">
      <i class="pi pi-search" aria-hidden="true"></i>
      <input
        ref="dialogInput"
        v-model="query"
        class="workspace-control"
        type="search"
        autocomplete="off"
        :placeholder="$t('project_search.placeholder')"
        :aria-label="$t('project_search.placeholder')"
        @keydown.enter.prevent="openSearchFromKeyboard"
      />
      <button
        v-if="query"
        type="button"
        class="project-search-dialog__input-clear"
        :aria-label="$t('project_search.clear')"
        :title="$t('project_search.clear')"
        @click="clearSearch"
      >
        <i class="pi pi-times" aria-hidden="true"></i>
      </button>
    </div>

    <div class="project-search-dialog__content" aria-live="polite" :aria-busy="loading">
      <div v-if="loading" class="project-search-dialog__skeletons">
        <div v-for="index in 4" :key="index" class="project-search-dialog__skeleton-row">
          <Skeleton shape="circle" size="3rem" />
          <div>
            <Skeleton width="45%" height="1rem" />
            <Skeleton width="75%" height="0.75rem" />
          </div>
          <Skeleton width="6rem" height="2rem" />
        </div>
      </div>

      <div v-else-if="errorMessage" class="project-search-dialog__state" role="alert">
        <span class="project-search-dialog__state-icon project-search-dialog__state-icon--error">
          <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
        </span>
        <h3>{{ $t('project_search.error_title') }}</h3>
        <p>{{ errorMessage }}</p>
        <button type="button" class="project-search-dialog__primary-action" @click="retrySearch">
          <i class="pi pi-refresh" aria-hidden="true"></i>
          {{ $t('project_search.retry') }}
        </button>
      </div>

      <div v-else-if="!canSearch" class="project-search-dialog__state">
        <span class="project-search-dialog__state-icon">
          <i class="pi pi-keyboard" aria-hidden="true"></i>
        </span>
        <h3>{{ $t('project_search.start_title') }}</h3>
        <p>{{ $t('project_search.minimum_characters') }}</p>
      </div>

      <div v-else-if="hasSearched && results.length === 0" class="project-search-dialog__state">
        <span class="project-search-dialog__state-icon">
          <i class="pi pi-folder-open" aria-hidden="true"></i>
        </span>
        <h3>{{ $t('project_search.empty_title') }}</h3>
        <p>{{ $t('project_search.empty_message', { keyword }) }}</p>
      </div>

      <div v-else-if="results.length" class="project-search-dialog__results">
        <article
          v-for="project in results"
          :key="project.id ?? `${project.title}-${project.createdAt}`"
          class="project-search-card"
          :class="{ 'project-search-card--disabled': project.id === undefined }"
          role="link"
          :tabindex="project.id === undefined ? -1 : 0"
          @click="viewProject(project)"
          @keydown.enter.prevent="viewProject(project)"
          @keydown.space.prevent="viewProject(project)"
        >
          <span class="project-search-card__avatar" aria-hidden="true">
            <i class="pi pi-building"></i>
          </span>

          <div class="project-search-card__body">
            <div class="project-search-card__title-row">
              <h3>{{ displayText(project.title) }}</h3>
              <span v-if="project.status" class="status-badge" :class="`status-${project.status}`">
                {{ $t(getConvertStatusNameKey(project.status)) }}
              </span>
              <span v-else>-</span>
            </div>

            <dl class="project-search-card__metadata">
              <div>
                <dt><i class="pi pi-user" aria-hidden="true"></i>{{ $t('client') }}</dt>
                <dd>{{ displayText(project.client?.name) }}</dd>
              </div>
              <div>
                <dt><i class="pi pi-tag" aria-hidden="true"></i>{{ $t('project.Type') }}</dt>
                <dd>{{ displayText(project.projectType?.title) }}</dd>
              </div>
              <div>
                <dt><i class="pi pi-calendar" aria-hidden="true"></i>{{ $t('createdAt') }}</dt>
                <dd>{{ formatCreationDate(project.createdAt) }}</dd>
              </div>
            </dl>
          </div>

          <button
            type="button"
            class="project-search-card__action"
            :disabled="project.id === undefined"
            @click.stop="viewProject(project)"
          >
            {{ $t('project_search.view_project') }}
            <i class="pi pi-arrow-up-right" aria-hidden="true"></i>
          </button>
        </article>
      </div>
    </div>

    <template #footer>
      <div class="project-search-dialog__footer">
        <button
          type="button"
          class="project-search-dialog__secondary-action"
          :disabled="!query"
          @click="clearSearch"
        >
          <i class="pi pi-eraser" aria-hidden="true"></i>
          {{ $t('project_search.clear') }}
        </button>
        <button type="button" class="project-search-dialog__primary-action" @click="closeDialog">
          {{ $t('close') }}
        </button>
      </div>
    </template>
  </Dialog>
</template>

<style scoped lang="scss">
@use '../styles/project_status_badge' as project-status-badge;

@include project-status-badge.project-status-badges;

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.global-project-search {
  min-width: 0;
  width: 40%;
  max-height: 48px;

  @media (max-width: 768px) {
    width: 100%;
  }

  &--compact {
    flex: 0 0 auto;
    width: auto;
  }

  &__field {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    height: 48px;
    padding-inline: 0.875rem;
    border: 1px solid color-mix(in sRGB, var(--PrimaryColor) 14%, var(--border-weak));
    border-radius: var(--radius-md);
    background: color-mix(in sRGB, var(--BgWhite) 96%, var(--PrimaryColor) 4%);
    cursor: text;
    transition:
      border-color var(--transition-fast),
      background var(--transition-fast),
      box-shadow var(--transition-fast);

    > .pi-search {
      flex: 0 0 auto;
      color: var(--gray-500);
      font-size: 1rem;
    }

    &:hover {
      border-color: color-mix(in sRGB, var(--PrimaryColor) 32%, var(--border-weak));
    }

    &:focus-within {
      border-color: var(--PrimaryColor);
      background: var(--BgWhite);
      box-shadow: none;
    }

    input {
      flex: 1 1 auto;
      min-width: 0;
      padding: 0;
      border: 0;
      outline: 0;
      color: var(--gray-900);
      background: transparent;
      font: inherit;
      font-size: var(--sm-size);

      &::placeholder {
        color: var(--gray-500);
        opacity: 1;
      }
    }
  }

  &__compact-trigger {
    display: grid;
    width: 40px;
    height: 40px;
    padding: 0;
    place-items: center;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    color: var(--PrimaryColor);
    background: var(--BgWhite);
    cursor: pointer;
    transition:
      border-color var(--transition-fast),
      background var(--transition-fast),
      transform var(--transition-fast);

    &:hover,
    &:focus-visible {
      border-color: color-mix(in sRGB, var(--PrimaryColor) 36%, var(--border-weak));
      background: color-mix(in sRGB, var(--BgWhite) 92%, var(--PrimaryColor) 8%);
    }

    &:focus-visible {
      outline: 3px solid color-mix(in sRGB, var(--PrimaryColor) 20%, transparent);
      outline-offset: 2px;
    }

    &:active {
      transform: scale(0.96);
    }
  }
}

:global(.project-search-dialog) {
  width: min(860px, calc(100vw - 2rem));
  max-height: min(780px, calc(100vh - 2rem));
  overflow: hidden;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-lg);
  background: var(--BgWhite);
  box-shadow: var(--bh-shadow-popover);
}

:global(.project-search-dialog .p-dialog-header) {
  padding: 1.25rem 1.25rem 0.875rem;
}

:global(.project-search-dialog .p-dialog-content) {
  padding: 0 1.25rem;
  overflow: hidden;
}

:global(.project-search-dialog .p-dialog-footer) {
  padding: 0.875rem 1.25rem 1.25rem;
}

.project-search-dialog {
  &__heading,
  &__heading-icon,
  &__search-field,
  &__skeleton-row,
  &__footer,
  &__primary-action,
  &__secondary-action {
    display: flex;
    align-items: center;
  }

  &__heading {
    min-width: 0;
    gap: 0.875rem;

    h2,
    p {
      margin: 0;
    }

    h2 {
      color: var(--gray-900);
      font-family: 'Bold';
      font-size: 1.125rem;
    }

    p {
      margin-block-start: 0.2rem;
      overflow: hidden;
      color: var(--gray-500);
      font-size: var(--sm-size);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__heading-icon,
  &__state-icon {
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: var(--radius-md);
    color: var(--PrimaryColor);
    background: color-mix(in sRGB, var(--BgWhite) 88%, var(--PrimaryColor) 12%);
  }

  &__heading-icon {
    width: 44px;
    height: 44px;
    font-size: 1.1rem;
  }

  &__search-field {
    gap: 0.75rem;
    min-height: 48px;
    padding-inline: 0.875rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--gray-50);
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);

    &:focus-within {
      border-color: var(--PrimaryColor);
      box-shadow: var(--bh-shadow-popover);
    }

    > .pi-search {
      color: var(--gray-500);
    }

    input {
      flex: 1 1 auto;
      min-width: 0;
      padding: 0;
      border: 0;
      outline: 0;
      color: var(--gray-900);
      background: transparent;
      font: inherit;
    }
  }

  &__input-clear {
    display: grid;
    width: 32px;
    height: 32px;
    padding: 0;
    place-items: center;
    border: 0;
    border-radius: var(--bh-radius-control);
    color: var(--gray-500);
    background: transparent;
    cursor: pointer;

    &:hover,
    &:focus-visible {
      color: var(--gray-900);
      background: var(--gray-100);
    }

    &:focus-visible {
      outline: 2px solid var(--PrimaryColor);
      outline-offset: 1px;
    }
  }

  &__content {
    min-height: 280px;
    max-height: min(480px, calc(100vh - 19rem));
    margin-block-start: 1rem;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-color: var(--gray-400) var(--gray-100);
  }

  &__skeletons,
  &__results {
    display: grid;
    gap: 0.625rem;
  }

  &__skeleton-row {
    gap: 0.875rem;
    min-height: 96px;
    padding: 0.875rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);

    > div {
      display: grid;
      flex: 1 1 auto;
      gap: 0.625rem;
    }
  }

  &__state {
    display: flex;
    min-height: 280px;
    padding: 2rem;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;

    h3,
    p {
      margin: 0;
    }

    h3 {
      margin-block-start: 1rem;
      color: var(--gray-900);
      font-family: 'Bold';
      font-size: 1rem;
    }

    p {
      max-width: 28rem;
      margin-block: 0.4rem 1rem;
      color: var(--gray-500);
      font-size: var(--sm-size);
      line-height: 1.6;
    }
  }

  &__state-icon {
    width: 52px;
    height: 52px;
    font-size: 1.25rem;

    &--error {
      color: var(--btn-red);
      background: color-mix(in sRGB, var(--BgWhite) 90%, var(--btn-red) 10%);
    }
  }

  &__footer {
    justify-content: space-between;
    gap: 0.75rem;
    width: 100%;
  }

  &__primary-action,
  &__secondary-action {
    justify-content: center;
    gap: 0.5rem;
    min-height: 40px;
    padding-inline: 1rem;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font: inherit;
    font-size: var(--sm-size);
    font-weight: 700;
    transition:
      border-color var(--transition-fast),
      background var(--transition-fast),
      color var(--transition-fast),
      transform var(--transition-fast);

    &:focus-visible {
      outline: 3px solid color-mix(in sRGB, var(--PrimaryColor) 20%, transparent);
      outline-offset: 2px;
    }

    &:active:not(:disabled) {
      transform: translateY(1px);
    }
  }

  &__primary-action {
    border: 1px solid var(--PrimaryColor);
    color: var(--BgWhite);
    background: var(--PrimaryColor);

    &:hover,
    &:focus-visible {
      background: color-mix(in sRGB, var(--PrimaryColor) 88%, var(--gray-900) 12%);
    }
  }

  &__secondary-action {
    border: 1px solid var(--border-weak);
    color: var(--gray-700);
    background: var(--BgWhite);

    &:hover,
    &:focus-visible {
      border-color: var(--gray-300);
      background: var(--gray-100);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.project-search-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  min-width: 0;
  padding: 0.875rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-md);
  background: var(--BgWhite);
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    background var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);

  &:hover,
  &:focus-visible {
    border-color: color-mix(in sRGB, var(--PrimaryColor) 36%, var(--border-weak));
    background: color-mix(in sRGB, var(--BgWhite) 97%, var(--PrimaryColor) 3%);
    box-shadow: none;
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 3px solid color-mix(in sRGB, var(--PrimaryColor) 18%, transparent);
    outline-offset: 1px;
  }

  &--disabled {
    cursor: default;
    opacity: 0.65;
  }

  &__avatar {
    display: grid;
    flex: 0 0 48px;
    width: 48px;
    height: 48px;
    place-items: center;
    border-radius: var(--radius-md);
    color: var(--PrimaryColor);
    background: color-mix(in sRGB, var(--BgWhite) 86%, var(--PrimaryColor) 14%);
    font-size: 1.1rem;
  }

  &__body {
    flex: 1 1 auto;
    min-width: 0;
  }

  &__title-row {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.625rem;

    h3 {
      flex: 1 1 auto;
      min-width: 0;
      margin: 0;
      overflow: hidden;
      color: var(--gray-900);
      font-family: 'Bold';
      font-size: 0.9375rem;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__metadata {
    display: flex;
    min-width: 0;
    margin: 0.5rem 0 0;
    gap: 0.75rem 1rem;

    div {
      display: flex;
      min-width: 0;
      align-items: center;
      gap: 0.3rem;
    }

    dt,
    dd {
      margin: 0;
      overflow: hidden;
      font-size: 0.6875rem;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    dt {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--gray-500);
    }

    dd {
      color: var(--gray-700);
      font-weight: 700;
    }
  }

  &__action {
    display: inline-flex;
    flex: 0 0 auto;
    min-height: 36px;
    padding-inline: 0.75rem;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    border: 1px solid color-mix(in sRGB, var(--PrimaryColor) 22%, var(--border-weak));
    border-radius: var(--radius-sm);
    color: var(--PrimaryColor);
    background: color-mix(in sRGB, var(--BgWhite) 94%, var(--PrimaryColor) 6%);
    cursor: pointer;
    font: inherit;
    font-size: 0.75rem;
    font-weight: 700;

    &:hover,
    &:focus-visible {
      border-color: var(--PrimaryColor);
      background: color-mix(in sRGB, var(--BgWhite) 88%, var(--PrimaryColor) 12%);
    }

    &:focus-visible {
      outline: 2px solid color-mix(in sRGB, var(--PrimaryColor) 20%, transparent);
      outline-offset: 2px;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pi {
      transform: scaleX(var(--direction-factor, 1));
    }
  }
}

[dir='rtl'] .project-search-card__action .pi-arrow-up-right {
  transform: scaleX(-1);
}

@media (max-width: 640px) {
  :global(.project-search-dialog) {
    width: calc(100vw - 1rem);
    max-height: calc(100dvh - 1rem);
  }

  :global(.project-search-dialog .p-dialog-header) {
    padding: 1rem 1rem 0.75rem;
  }

  :global(.project-search-dialog .p-dialog-content) {
    padding-inline: 1rem;
  }

  :global(.project-search-dialog .p-dialog-footer) {
    padding: 0.75rem 1rem 1rem;
  }

  .project-search-dialog__content {
    max-height: calc(100dvh - 18rem);
  }

  .project-search-card {
    align-items: flex-start;
    flex-wrap: wrap;

    &__body {
      width: calc(100% - 4rem);
    }

    &__metadata {
      flex-direction: column;
      gap: 0.35rem;
    }

    &__action {
      width: 100%;
      margin-inline-start: 4rem;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .global-project-search__field,
  .global-project-search__compact-trigger,
  .project-search-dialog__search-field,
  .project-search-dialog__primary-action,
  .project-search-dialog__secondary-action,
  .project-search-card {
    transition: none;
  }
}
</style>
