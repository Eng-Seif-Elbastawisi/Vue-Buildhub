<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import type ProjectFloorShowModel from '../../core/models/project.floor.show.model';
  import AddProjectFloorParams from '../../core/params/add.project.floor.params';
  import { Status } from '../../core/constants/status.enum';
  import ProjectPreviewIndex from '../../../../../modules/MainOrganization/Project/presentation/components/project_preview/ProjectPreviewIndex.vue';

  const emit = defineEmits<{
    updateData: [params: AddProjectFloorParams];
  }>();

  const props = defineProps<{
    projectFloor?: ProjectFloorShowModel;
    projectId?: number;
    projectPreviewId?: number;
    loading?: boolean;
    isEdit?: boolean;
  }>();

  const { t } = useI18n();

  const floorNumber = ref<string>('');
  const siteDescription = ref<string>('');
  const technicalGeneralNotes = ref<string>('');
  const inspectionRecommendations = ref<string>('');
  const selectedStatus = ref<TitleInterface<Status> | null>(null);

  const statusOptions = computed<TitleInterface<Status>[]>(() => [
    {
      id: Status.NEED_ADDITIONAL_VISIT,
      title: t('project.status_need_additional_visit'),
    },
    {
      id: Status.NOT_READY_FOR_COMPLETION,
      title: t('project.status_not_ready_for_completion'),
    },
    {
      id: Status.READY_FOR_PRICING,
      title: t('project.status_ready_for_pricing'),
    },
  ]);

  const getProjectId = () => {
    return props.projectFloor?.project_id ?? props.projectId ?? 0;
  };

  const getProjectPreviewId = () => {
    return props.projectFloor?.project_preview_id ?? props.projectPreviewId ?? 0;
  };

  const updateData = () => {
    emit(
      'updateData',
      new AddProjectFloorParams({
        project_id: getProjectId(),
        project_preview_id: getProjectPreviewId(),
        status: selectedStatus.value?.id,
        floor_number: floorNumber.value,
        site_description: siteDescription.value,
        technical_general_notes: technicalGeneralNotes.value,
        inspection_recommendations: inspectionRecommendations.value,
      }),
    );
  };

  const updateStatus = (value: TitleInterface<Status>) => {
    selectedStatus.value = value;
    updateData();
  };

  watch(
    () => props.projectFloor,
    (projectFloor) => {
      if (!projectFloor) {
        selectedStatus.value =
          statusOptions.value.find((item) => item.id === Status.NEED_ADDITIONAL_VISIT) ?? null;

        updateData();
        return;
      }

      floorNumber.value = projectFloor.floor_number ?? '';
      siteDescription.value = projectFloor.site_description ?? '';
      technicalGeneralNotes.value = projectFloor.technical_general_notes ?? '';
      inspectionRecommendations.value = projectFloor.inspection_recommendations ?? '';

      selectedStatus.value =
        statusOptions.value.find((item) => item.id === projectFloor.status) ??
        statusOptions.value.find((item) => item.id === Status.NEED_ADDITIONAL_VISIT) ??
        null;

      updateData();
    },
    { immediate: true },
  );

  watch(
    () => [props.projectId, props.projectPreviewId],
    () => {
      updateData();
    },
  );
</script>

<template>
  <ProjectPreviewIndex />
  <div class="ProjectFloor-form-card">
    <header>
      <h3>{{ $t('ProjectFloor.form_title') }}</h3>
      <p>{{ $t('ProjectFloor.form_description') }}</p>
    </header>

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group">
        <label class="field-label" for="floor_number">
          {{ $t('ProjectFloor.floor_number') }}
        </label>

        <input
          id="floor_number"
          v-model="floorNumber"
          class="field-input"
          type="text"
          :placeholder="$t('ProjectFloor.floor_number_placeholder')"
          @input="updateData"
        />
      </div>

      <div class="field-group col-span-2">
        <label class="field-label">
          {{ $t('status') }}
        </label>

        <div class="service-tabs">
          <button
            v-for="option in statusOptions"
            :key="option.id"
            type="button"
            class="service-tab"
            :class="{ active: selectedStatus?.id === option.id }"
            @click="updateStatus(option)"
          >
            <span class="service-tab__icon">
              {{
                option.id === Status.NEED_ADDITIONAL_VISIT
                  ? '🔁'
                  : option.id === Status.NOT_READY_FOR_COMPLETION
                    ? '⚠️'
                    : '✅'
              }}
            </span>

            <span class="service-tab__title">
              {{ option.title }}
            </span>
          </button>
        </div>
      </div>

      <div class="field-group col-span-2">
        <label class="field-label" for="site_description">
          {{ $t('ProjectFloor.site_description') }}
        </label>

        <textarea
          id="site_description"
          v-model="siteDescription"
          class="field-input field-textarea"
          :placeholder="$t('ProjectFloor.site_description_placeholder')"
          @input="updateData"
        />
      </div>

      <div class="field-group col-span-2">
        <label class="field-label" for="technical_general_notes">
          {{ $t('ProjectFloor.technical_general_notes') }}
        </label>

        <textarea
          id="technical_general_notes"
          v-model="technicalGeneralNotes"
          class="field-input field-textarea"
          :placeholder="$t('ProjectFloor.technical_general_notes_placeholder')"
          @input="updateData"
        />
      </div>

      <div class="field-group col-span-2">
        <label class="field-label" for="inspection_recommendations">
          {{ $t('ProjectFloor.inspection_recommendations') }}
        </label>

        <textarea
          id="inspection_recommendations"
          v-model="inspectionRecommendations"
          class="field-input field-textarea"
          :placeholder="$t('ProjectFloor.inspection_recommendations_placeholder')"
          @input="updateData"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .ProjectFloor-form-card {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  header p {
    color: var(--gray-5);
  }

  .form-fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    align-items: end;

    &.disabled {
      pointer-events: none;
      opacity: 0.7;
    }
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .field-label {
    font-family: 'Medium';
    font-size: var(--sm-size);
    color: var(--gray-6);
  }

  .field-input {
    width: 100%;
    min-height: 46px;
    padding: 12px 16px;
    border: 1px solid var(--border-weak);
    border-radius: 28px;
    background: var(--white);
    outline: none;
    transition: all 0.25s ease;
    font-family: 'Medium';
    font-weight: 400;
    font-size: var(--sm-size);
    color: var(--bread-crumb-color-span);
  }

  .field-input:focus {
    border-color: var(--PrimaryColor);
  }

  .field-textarea {
    min-height: 110px;
    resize: vertical;
    border-radius: 18px;
  }

  .service-tabs {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .service-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 48px;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-weak);
    border-radius: 28px;
    background: var(--white);
    cursor: pointer;
    font-family: 'Medium';
    font-size: var(--sm-size);
    color: var(--bread-crumb-color-span);
    transition: all 0.25s ease;

    &:hover {
      border-color: var(--PrimaryColor);
      background: var(--PrimaryColor-light);
    }

    &.active {
      border-color: var(--PrimaryColor);
      background: var(--PrimaryColor-light);
      color: var(--PrimaryColor);
      box-shadow: 0 0 0 1px var(--PrimaryColor);
    }
  }

  .service-tab__icon {
    line-height: 1;
  }

  .service-tab__title {
    white-space: nowrap;
  }

  .col-span-2 {
    grid-column: span 2;
  }

  @media (max-width: 768px) {
    .form-fields {
      grid-template-columns: 1fr;
    }

    .service-tabs {
      grid-template-columns: 1fr;
    }

    .col-span-2 {
      grid-column: span 1;
    }
  }
</style>
