<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';

  import type AddProjectFloorParams from '../../core/params/add.project.floor.params';
  import IndexProjectFloorParams from '../../core/params/index.project.floor.params';

  import ProjectFloorController from '../controllers/project.floor.controller';
  import ProjectFloorForm from './ProjectFloorForm.vue';
  import ProjectSteps from '../../../Project/presentation/components/ProjectSteps.vue';
  import type ProjectFloorModel from '../../core/models/project.floor.model';
  import type AddFinalProjectFloorResultParams from '../../core/params/final.result.project.floor.params';
  import FinalResults from './FinalResults.vue';

  import router from '@/router/index';
  import { useUserStore } from '@/stores/user';
  import { type FloorNumber } from '../../core/constants/floor.number.enum.ts';
  import { Status } from '../../core/constants/status.enum';
  import { useI18n } from 'vue-i18n';
  import { getFloorNumberNameKey } from '../../core/constants/floor.number.enum';
  const controller = ProjectFloorController.getInstance();

  const route = useRoute();
  const userStore = useUserStore();
  const { t } = useI18n();
  const params = ref<AddProjectFloorParams | null>(null);
  const loading = ref(false);

  const openedFloorIds = ref<Set<number>>(new Set());

  const isFloorOpen = (floorId?: number): boolean => {
    if (floorId === undefined) return false;

    return openedFloorIds.value.has(floorId);
  };

  const toggleFloor = (floorId?: number) => {
    if (floorId === undefined) return;

    const nextOpenedFloorIds = new Set(openedFloorIds.value);

    if (nextOpenedFloorIds.has(floorId)) {
      nextOpenedFloorIds.delete(floorId);
    } else {
      nextOpenedFloorIds.add(floorId);
    }

    openedFloorIds.value = nextOpenedFloorIds;
  };

  const projectFloorFormRef = ref<{
    resetForm: () => void;
  } | null>(null);

  const getPrefix = () => {
    return userStore.user?.type === 1 ? '/mainportal' : '/organization';
  };

  const toPositiveInteger = (value: unknown): number | undefined => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;
    const numberValue = Number(normalizedValue);

    return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : undefined;
  };

  const projectId = computed(() => toPositiveInteger(route.query.project_id));
  const projectPreviewId = computed(() => toPositiveInteger(route.query.project_preview_id));

  const toRecord = (value: unknown): Record<string, unknown> | undefined => {
    return value && typeof value === 'object' ? (value as Record<string, unknown>) : undefined;
  };

  const projectFloors = computed<ProjectFloorModel[]>(() => {
    const state = toRecord(controller.listState.value);
    const stateData = state?.data;
    const responseData = toRecord(state?.response)?.data;
    const candidates = [
      toRecord(stateData)?.data,
      toRecord(responseData)?.data,
      stateData,
      responseData,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate as ProjectFloorModel[];
      }
    }

    return [];
  });

  const hasSavedFloor = computed<boolean>(() => {
    return projectFloors.value.length > 0;
  });

  const isPreviewMode = computed<boolean>(() => {
    return projectPreviewId.value !== undefined;
  });

  const canShowFinalResults = computed<boolean>(() => {
    return isPreviewMode.value && hasSavedFloor.value;
  });

  const canShowNextStep = computed<boolean>(() => {
    return !isPreviewMode.value;
  });

  const projectItem = computed(() => {
    return projectFloors.value[0]?.id ?? 0;
  });

  const fetchProjectFloors = async () => {
    if (projectId.value === undefined) return;

    await controller.fetchList(new IndexProjectFloorParams('', 1, 100, 1, null, projectId.value));
  };

  const saveProjectFloor = async () => {
    if (!params.value) return;

    loading.value = true;

    try {
      await controller.create(params.value, undefined, route.fullPath);

      await fetchProjectFloors();

      projectFloorFormRef.value?.resetForm();
      params.value = null;
    } finally {
      loading.value = false;
    }
  };

  const submitFinalResult = async (finalParams: AddFinalProjectFloorResultParams) => {
    const currentProjectId = projectId.value;

    if (!currentProjectId || loading.value) {
      return;
    }

    loading.value = true;

    try {
      await controller.getProject(finalParams);

      if (finalParams.status === Status.NOT_READY_FOR_COMPLETION) {
        await router.push({ name: 'project' });
      } else {
        await router.push({
          path: `${getPrefix()}/Project/show/${currentProjectId}`,
        });
      }
    } finally {
      loading.value = false;
    }
  };

  const goToNextStep = async () => {
    const currentProjectId = projectId.value;

    if (!currentProjectId || loading.value) {
      return;
    }

    await router.push({
      path: `${getPrefix()}/Project/show/${currentProjectId}`,
    });
  };
  const goToProjectShow = async () => {
    const currentProjectId = projectId.value;

    if (!currentProjectId || loading.value) {
      return;
    }

    await router.push({
      path: `${getPrefix()}/Project/show/${currentProjectId}`,
    });
  };

  onMounted(async () => {
    await fetchProjectFloors();
  });
  const floorTitle = (floorNumber?: number | string | null) => {
    if (floorNumber === null || floorNumber === undefined) return '-';

    const key = getFloorNumberNameKey(floorNumber as FloorNumber);

    return key === 'unknown' ? String(floorNumber) : t(key);
  };
</script>

<template>
  <div class="ProjectFloor-crud-page">
    <ProjectSteps :current-step="3" />

    <ProjectFloorForm
      ref="projectFloorFormRef"
      :loading="loading"
      :project-id="projectId"
      :project-preview-id="projectPreviewId"
      @update-data="params = $event"
    />

    <div class="buttons-container form-action-pair">
      <button
        :class="{ 'btn--loading': loading }"
        class="btn btn-primary"
        type="button"
        :disabled="loading || !params"
        @click="saveProjectFloor"
      >
        {{ $t('Project.save') }}
      </button>

      <button
        :class="{ 'btn--loading': loading }"
        class="btn btn-secondary"
        type="button"
        :disabled="loading || !params"
        @click="router.back()"
      >
        {{ $t('back_step') }}
      </button>
    </div>

    <section v-if="projectFloors.length" class="saved-floors">
      <header class="saved-floors__header">
        <div>
          <h3>{{ $t('ProjectFloor.selected_spaces') }}</h3>
          <p>{{ $t('ProjectFloor.selected_spaces_description') }}</p>
        </div>

        <strong>{{ projectFloors.length }}</strong>
      </header>

      <article
        v-for="floor in projectFloors"
        :key="floor.id"
        class="saved-floor-card"
        :class="{ 'saved-floor-card--open': isFloorOpen(floor.id) }"
      >
        <button
          class="saved-floor-card__head"
          type="button"
          :aria-expanded="isFloorOpen(floor.id)"
          :aria-controls="`floor-content-${floor.id}`"
          @click="toggleFloor(floor.id)"
        >
          <span class="saved-floor-card__title">
            <span class="saved-floor-card__icon">
              <i class="pi pi-building"></i>
            </span>

            <span>
              <small>{{ $t('ProjectFloor.floor_number') }}</small>

              <strong>
                {{ floorTitle(floor.floor_number) }}
              </strong>
            </span>
          </span>

          <span class="saved-floor-card__actions">
            <span class="saved-floor-card__count">
              {{ Array.isArray(floor.spaces) ? floor.spaces.length : 0 }}
            </span>

            <span
              class="saved-floor-card__chevron"
              :class="{ 'saved-floor-card__chevron--open': isFloorOpen(floor.id) }"
            >
              <i class="pi pi-chevron-down"></i>
            </span>
          </span>
        </button>

        <Transition name="floor-collapse">
          <div
            v-if="isFloorOpen(floor.id)"
            :id="`floor-content-${floor.id}`"
            class="saved-floor-card__content"
          >
            <div
              v-if="Array.isArray(floor.spaces) && floor.spaces.length"
              class="saved-spaces-table"
            >
              <div class="saved-spaces-table__head">
                <span>#</span>
                <span>{{ $t('ProjectFloor.space') }}</span>
                <span>{{ $t('ProjectFloor.length') }}</span>
                <span>{{ $t('ProjectFloor.width') }}</span>
                <span>{{ $t('ProjectFloor.height') }}</span>
                <span>{{ $t('ProjectFloor.notes') }}</span>
                <span>{{ $t('ProjectFloor.attachments') }}</span>
              </div>

              <div v-for="(space, index) in floor.spaces" :key="space.id" class="saved-space-row">
                <span>{{ index + 1 }}</span>

                <strong>
                  {{ space.space?.title ?? '-' }}
                </strong>

                <span>{{ space.length ?? '-' }}</span>
                <span>{{ space.width ?? '-' }}</span>
                <span>{{ space.height ?? '-' }}</span>
                <span>{{ space.notes ?? '-' }}</span>

                <span>
                  {{ Array.isArray(space.attachments) ? space.attachments.length : 0 }}
                </span>
              </div>
            </div>

            <div v-else class="saved-floor-empty">
              {{ $t('ProjectFloor.no_spaces_title') }}
            </div>
          </div>
        </Transition>
      </article>
    </section>

    <FinalResults
      v-if="canShowFinalResults"
      :project-id="projectId"
      :project-preview-id="projectPreviewId"
      :loading="loading"
      @submit-final-result="submitFinalResult"
    />

    <div v-if="canShowNextStep" class="next-step-card">
      <div class="next-step-card__content">
        <span class="next-step-card__icon">
          <i class="pi pi-arrow-right"></i>
        </span>

        <div>
          <h3>{{ $t('Project.next_step') }}</h3>
          <p>{{ $t('ProjectFloor.continue_without_preview_description') }}</p>
        </div>
      </div>

      <div class="next-step-card__actions">
        <button
          class="btn next-step-card__button next-step-card__button--secondary"
          type="button"
          :disabled="loading || projectId === undefined"
          @click="goToProjectShow"
        >
          <i class="pi pi-eye"></i>
          <span>{{ $t('show') }}</span>
        </button>

        <button
          class="btn btn-primary next-step-card__button"
          type="button"
          :disabled="loading || !projectFloors.length || projectItem <= 0"
          @click="goToNextStep"
        >
          <span>{{ $t('next') }}</span>
          <i class="pi pi-arrow-right"></i>
        </button>
      </div>
    </div>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/mixins/form_action_pair' as form-actions;

  .ProjectFloor-crud-page {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .error {
    margin-top: 20px;
    padding: 10px;
    background-color: var(--danger-light);
    color: var(--danger-dark);
    border: 1px solid #f5c6cb;
    border-radius: 4px;
  }

  .next-step-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.1rem;
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 20px;
    background: linear-gradient(135deg, var(--PrimaryColor-light), var(--BgWhite));
    box-shadow: 0 10px 28px rgba(99, 102, 241, 0.08);
  }

  .next-step-card__content {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.9rem;

    h3 {
      margin: 0;
      color: #111827;
      font-family: 'Bold';
      font-size: 1rem;
    }

    p {
      margin: 0.3rem 0 0;
      color: #64748b;
      font-size: var(--xs-size);
    }
  }

  .next-step-card__icon {
    display: inline-flex;
    width: 46px;
    height: 46px;
    flex: 0 0 46px;
    align-items: center;
    justify-content: center;
    border-radius: 15px;
    background: var(--BgWhite);
    color: var(--PrimaryColor);
    box-shadow: 0 6px 18px rgba(99, 102, 241, 0.14);
  }

  .next-step-card__actions {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 0.75rem;
  }

  .next-step-card__button {
    display: inline-flex;
    width: auto;
    min-width: 150px;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
  }

  .next-step-card__button--secondary {
    border: 1px solid rgba(99, 102, 241, 0.28);
    background: var(--BgWhite);
    color: var(--PrimaryColor);

    &:hover {
      border-color: var(--PrimaryColor);
      background: var(--PrimaryColor-light);
    }
  }

  .saved-floors {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .saved-floors__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 20px;
    background: var(--BgWhite);

    h3 {
      margin: 0;
      color: #111827;
      font-family: 'Bold';
      font-size: 1rem;
    }

    p {
      margin: 0.25rem 0 0;
      color: #64748b;
      font-size: var(--xs-size);
    }

    strong {
      display: inline-flex;
      min-width: 42px;
      height: 42px;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      background: var(--PrimaryColor-light);
      color: var(--PrimaryColor);
      font-family: 'Bold';
    }
  }

  .saved-floor-card {
    overflow: hidden;
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 22px;
    background: #fff;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
    transition:
      border-color 0.25s ease,
      box-shadow 0.25s ease,
      transform 0.25s ease;

    &:hover {
      transform: translateY(-1px);
      border-color: rgba(99, 102, 241, 0.28);
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.07);
    }

    &--open {
      border-color: rgba(99, 102, 241, 0.34);
      box-shadow: 0 14px 34px rgba(99, 102, 241, 0.1);
    }
  }

  .saved-floor-card__head {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.1rem;
    border: 0;
    background: linear-gradient(135deg, var(--PrimaryColor-light), #fff);
    color: inherit;
    cursor: pointer;
    text-align: start;
  }

  .saved-floor-card__title {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.85rem;

    > span:last-child {
      display: flex;
      min-width: 0;
      flex-direction: column;
      gap: 0.2rem;
    }

    small {
      color: #64748b;
      font-family: 'Medium';
      font-size: var(--xs-size);
    }

    strong {
      overflow: hidden;
      color: #111827;
      font-family: 'Bold';
      font-size: var(--sm-size);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .saved-floor-card__icon {
    display: inline-flex;
    width: 42px;
    height: 42px;
    flex: 0 0 42px;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    background: var(--BgWhite);
    color: var(--PrimaryColor);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.12);
  }

  .saved-floor-card__actions {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 0.65rem;
  }

  .saved-floor-card__count {
    display: inline-flex;
    min-width: 34px;
    height: 34px;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: var(--BgWhite);
    color: var(--PrimaryColor);
    font-family: 'Bold';
  }

  .saved-floor-card__chevron {
    display: inline-flex;
    width: 34px;
    height: 34px;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.72);
    color: #64748b;
    transition:
      transform 0.25s ease,
      color 0.25s ease,
      background 0.25s ease;

    &--open {
      transform: rotate(180deg);
      background: var(--PrimaryColor);
      color: #fff;
    }
  }

  .saved-floor-card__content {
    padding: 0 1rem 1rem;
  }

  .floor-collapse-enter-active,
  .floor-collapse-leave-active {
    overflow: hidden;
    transition:
      opacity 0.22s ease,
      transform 0.22s ease;
  }

  .floor-collapse-enter-from,
  .floor-collapse-leave-to {
    opacity: 0;
    transform: translateY(-8px);
  }

  .saved-spaces-table {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 16px;
  }

  .saved-spaces-table__head,
  .saved-space-row {
    display: grid;
    grid-template-columns: 44px 1.4fr repeat(4, 1fr) 0.8fr;
    gap: 0.65rem;
    align-items: center;
  }

  .saved-spaces-table__head {
    padding: 0.75rem 1rem;
    background: #f8fafc;
    color: #64748b;
    font-family: 'Bold';
    font-size: var(--xs-size);
  }

  .saved-space-row {
    padding: 0.75rem 1rem;
    border-top: 1px solid rgba(148, 163, 184, 0.18);
    color: #334155;
    font-family: 'Medium';
    font-size: var(--sm-size);

    strong {
      overflow: hidden;
      color: #111827;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .saved-floor-empty {
    padding: 1rem;
    border: 1px dashed rgba(148, 163, 184, 0.45);
    border-radius: 16px;
    color: #64748b;
    text-align: center;
    font-family: 'Medium';
  }

  @media (max-width: 992px) {
    .saved-spaces-table__head {
      display: none;
    }

    .saved-space-row {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .next-step-card {
      align-items: stretch;
      flex-direction: column;
    }

    .next-step-card__actions {
      width: 100%;
      flex-direction: column;
    }

    .next-step-card__button {
      width: 100%;
    }
  }

  .form-action-pair {
    @include form-actions.layout;
  }
</style>
