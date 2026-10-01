<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type TitleInterface from '@/base/Data/Models/titleInterface';
import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';

import AddProjectFloorParams, {
  type ProjectFloorAttachmentParams,
  type ProjectFloorItemParams,
  type ProjectFloorSpaceParams,
} from '../../core/params/add.project.floor.params';
import { FloorNumber } from '../../core/constants/floor.number.enum';

import ProjectPreviewIndex from '../../../../../modules/MainOrganization/Project/presentation/components/project_preview/ProjectPreviewIndex.vue';
import type ProjectPreviewModel from '@/modules/MainOrganization/Project/core/models/project.preview.model';

import IndexSpaceParams from '@/modules/shared/Space/core/params/index.space.params';
import SpaceController from '@/modules/shared/Space/presentation/controllers/space.controller';
import type ProjectFloorModel from '../../core/models/project.floor.model';
import type ProjectFloorShowModel from '../../core/models/project.floor.show.model';

const emit = defineEmits<{
  updateData: [params: AddProjectFloorParams];
}>();

const props = withDefaults(
  defineProps<{
    projectFloor?: ProjectFloorModel | ProjectFloorShowModel;
    projectId?: number;
    projectPreviewId?: number;
    existingFloors?: ProjectFloorModel[];
    loading?: boolean;
    isEdit?: boolean;
    validationErrors?: Record<string, string>;
  }>(),
  {
    projectFloor: undefined,
    projectId: undefined,
    projectPreviewId: undefined,
    existingFloors: () => [],
    loading: false,
    isEdit: false,
    validationErrors: () => ({}),
  },
);

const { t } = useI18n();

const hasUpcomingPreview = ref(false);
const upcomingPreview = ref<ProjectPreviewModel | null>(null);
const previewWarningIgnored = ref(false);

const floorFormLocked = computed<boolean>(() => {
  return hasUpcomingPreview.value && !previewWarningIgnored.value && !props.isEdit;
});

const formatUpcomingPreviewDate = computed<string>(() => {
  const preview = upcomingPreview.value;

  if (!preview) return '';

  const date = preview.preview_date ?? '';
  const time = preview.preview_time ? preview.preview_time.slice(0, 5) : '';

  return [date, time].filter(Boolean).join(' ');
});

const handleUpcomingPreviewChange = (payload: {
  hasUpcoming: boolean;
  preview: ProjectPreviewModel | null;
}): void => {
  hasUpcomingPreview.value = payload.hasUpcoming;
  upcomingPreview.value = payload.preview;

  if (!payload.hasUpcoming) {
    previewWarningIgnored.value = false;
  }
};

const allowAddingBeforePreview = (): void => {
  previewWarningIgnored.value = true;
};

const keepFormLocked = (): void => {
  previewWarningIgnored.value = false;
};

const spaceController = SpaceController.getInstance();
const spaceParams = new IndexSpaceParams('', 1, 100, 0);

type SpaceRow = {
  space: TitleInterface<number>;
  length: string;
  width: string;
  height: string;
  notes: string;
  attachments: ProjectFloorAttachmentParams[];
};

type DimensionField = 'length' | 'width' | 'height';

const dimensionFields: DimensionField[] = ['length', 'width', 'height'];

type LocalFloor = {
  localId: number;
  floorNumber: TitleInterface<FloorNumber>;
  spaces: SpaceRow[];
  attachments: ProjectFloorAttachmentParams[];
};

const selectedFloorNumber = ref<TitleInterface<FloorNumber> | null>(null);
const selectedSpace = ref<TitleInterface<number>[]>([]);
const currentSpaces = ref<SpaceRow[]>([]);
const currentSpaceErrors = ref<Record<string, string>>({});
const duplicateFloorSpaceError = ref('');
const floors = ref<LocalFloor[]>([]);

const siteDescription = ref('');
const technicalGeneralNotes = ref('');
const inspectionRecommendations = ref('');

const floorNumberOptions = computed<TitleInterface<FloorNumber>[]>(() => [
  { id: FloorNumber.BASEMENT, title: t('project.BASEMENT') },
  { id: FloorNumber.GROUND_FLOOR, title: t('project.GROUND_FLOOR') },
  { id: FloorNumber.FIRST_FLOOR, title: t('project.FIRST_FLOOR') },
  { id: FloorNumber.SECOND_FLOOR, title: t('project.SECOND_FLOOR') },
  { id: FloorNumber.THIRD_FLOOR, title: t('project.THIRD_FLOOR') },
  { id: FloorNumber.FOURTH_FLOOR, title: t('project.FOURTH_FLOOR') },
  { id: FloorNumber.FIFTH_FLOOR, title: t('project.FIFTH_FLOOR') },
  { id: FloorNumber.SIXTH_FLOOR, title: t('project.SIXTH_FLOOR') },
  { id: FloorNumber.SEVENTH_FLOOR, title: t('project.SEVENTH_FLOOR') },
  { id: FloorNumber.EIGHTH_FLOOR, title: t('project.EIGHTH_FLOOR') },
  { id: FloorNumber.NINTH_FLOOR, title: t('project.NINTH_FLOOR') },
  { id: FloorNumber.TENTH_FLOOR, title: t('project.TENTH_FLOOR') },
]);

const spaceOptions = computed<TitleInterface<number>[]>(() => {
  const state = spaceController.listState.value as any;
  const data = state?.data?.data ?? state?.data ?? state?.response?.data?.data ?? [];

  if (!Array.isArray(data)) return [];

  return data.map((item) => ({
    id: Number(item.id),
    title: item.title ?? `#${item.id}`,
  }));
});

const totalSpacesCount = computed(() => {
  return floors.value.reduce((total, floor) => total + floor.spaces.length, 0);
});

const getProjectId = (): number | undefined => {
  return props.projectFloor?.project_id ?? props.projectId;
};

const getProjectPreviewId = (): number | undefined => {
  return props.projectFloor?.project_preview_id ?? props.projectPreviewId;
};

const getDefaultFloorNumber = () => {
  return floorNumberOptions.value.find((item) => item.id === FloorNumber.GROUND_FLOOR) ?? null;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const mapSpaceRowsToParams = (rows: SpaceRow[]): ProjectFloorSpaceParams[] => {
  return rows.map((item) => ({
    space_id: Number(item.space.id),
    length: Number(item.length),
    width: Number(item.width),
    height: Number(item.height),
    notes: item.notes,
    attachments: item.attachments.map((attachment) => ({
      file: attachment.file,
      alt: attachment.alt,
      link: attachment.link,
    })),
  }));
};

const mapFloorsToParams = (): ProjectFloorItemParams[] => {
  return floors.value.map((floor) => ({
    floor_number: floor.floorNumber.id,
    attachments: floor.attachments,
    spaces: mapSpaceRowsToParams(floor.spaces),
  }));
};

const updateData = () => {
  const projectId = getProjectId();
  if (!projectId) return;

  emit(
    'updateData',
    new AddProjectFloorParams({
      project_id: projectId,
      project_preview_id: getProjectPreviewId(),
      site_description: siteDescription.value,
      technical_general_notes: technicalGeneralNotes.value,
      inspection_recommendations: inspectionRecommendations.value,
      floors: mapFloorsToParams(),
    }),
  );
};

const updateFloorNumber = (value: TitleInterface<FloorNumber> | null) => {
  selectedFloorNumber.value = value;
  duplicateFloorSpaceError.value = '';
};

const updateSelectedSpace = (value: TitleInterface<number>[] | TitleInterface<number> | null) => {
  if (!value) {
    selectedSpace.value = [];
    return;
  }

  selectedSpace.value = Array.isArray(value) ? value : [value];
  duplicateFloorSpaceError.value = '';
};

const addSpace = () => {
  if (!selectedSpace.value.length) return;

  selectedSpace.value.forEach((space) => {
    const alreadyExists = currentSpaces.value.some(
      (item) => Number(item.space.id) === Number(space.id),
    );

    if (alreadyExists) return;

    currentSpaces.value.push({
      space: { ...space },
      length: '',
      width: '',
      height: '',
      notes: '',
      attachments: [],
    });
  });

  selectedSpace.value = [];
  duplicateFloorSpaceError.value = '';
};

const removeCurrentSpace = (index: number) => {
  currentSpaces.value.splice(index, 1);
  currentSpaceErrors.value = {};
  duplicateFloorSpaceError.value = '';
};

const mapExistingSpace = (space: ProjectFloorModel['spaces'][number]): SpaceRow => {
  return {
    space: { ...space.space },
    length: space.length,
    width: space.width,
    height: space.height,
    notes: space.notes,
    attachments: space.attachments.map((attachment) => ({
      file: attachment.file,
      alt: attachment.alt,
      link: attachment.link,
    })),
  };
};

const findSavedFloor = (floorNumber: FloorNumber): ProjectFloorModel | undefined => {
  return props.existingFloors.find((floor) => Number(floor.floor_number) === Number(floorNumber));
};

const currentSpaceErrorKey = (spaceIndex: number, field: DimensionField): string => {
  return `spaces.${spaceIndex}.${field}`;
};

const currentSpaceError = (spaceIndex: number, field: DimensionField): string | undefined => {
  const fieldKey = currentSpaceErrorKey(spaceIndex, field);

  return currentSpaceErrors.value[fieldKey] ?? props.validationErrors[fieldKey];
};

const clearCurrentSpaceError = (spaceIndex: number, field: DimensionField): void => {
  const fieldKey = currentSpaceErrorKey(spaceIndex, field);

  if (!currentSpaceErrors.value[fieldKey]) {
    return;
  }

  const nextErrors = { ...currentSpaceErrors.value };
  delete nextErrors[fieldKey];
  currentSpaceErrors.value = nextErrors;
};

const hasPositiveDimension = (value: string): boolean => {
  const dimension = Number(value);

  return Number.isFinite(dimension) && dimension > 0;
};

const validateCurrentSpaces = (): boolean => {
  const errors: Record<string, string> = {};

  currentSpaces.value.forEach((space, spaceIndex) => {
    dimensionFields.forEach((field) => {
      if (!hasPositiveDimension(space[field])) {
        errors[currentSpaceErrorKey(spaceIndex, field)] = t(
          'ProjectFloor.validation_dimension_positive',
          { field: t(`ProjectFloor.${field}`) },
        );
      }
    });
  });

  currentSpaceErrors.value = errors;

  return Object.keys(errors).length === 0;
};

const updateCurrentSpaceAttachments = async (event: Event, index: number) => {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files ?? []);

  const attachments = await Promise.all(
    files.map(async (file) => ({
      file: await fileToBase64(file),
      alt: file.name,
      link: null,
    })),
  );

  if (currentSpaces.value[index]) {
    currentSpaces.value[index].attachments = attachments;
  }
};

const addFloor = () => {
  if (
    !selectedFloorNumber.value ||
    !currentSpaces.value.length ||
    !validateCurrentSpaces()
  ) {
    return;
  }

  const existingFloorIndex = floors.value.findIndex(
    (floor) => Number(floor.floorNumber.id) === Number(selectedFloorNumber.value?.id),
  );
  const localFloor = floors.value[existingFloorIndex];
  const savedFloor = findSavedFloor(selectedFloorNumber.value.id);
  const existingSpaces = localFloor?.spaces ?? savedFloor?.spaces.map(mapExistingSpace) ?? [];
  const duplicateSpace = currentSpaces.value.find((space) => {
    return existingSpaces.some(
      (existingSpace) => Number(existingSpace.space.id) === Number(space.space.id),
    );
  });

  if (duplicateSpace) {
    duplicateFloorSpaceError.value = t('ProjectFloor.duplicate_floor_space', {
      floor: selectedFloorNumber.value.title,
      space: duplicateSpace.space.title,
    });

    return;
  }

  const floorData: LocalFloor = {
    localId: localFloor?.localId ?? savedFloor?.id ?? Date.now(),
    floorNumber: { ...selectedFloorNumber.value },
    spaces: [...existingSpaces, ...currentSpaces.value].map((space) => ({
      ...space,
      space: { ...space.space },
      attachments: [...space.attachments],
    })),
    attachments:
      localFloor?.attachments ??
      savedFloor?.attachments.map((attachment) => ({
        file: attachment.file,
        alt: attachment.alt,
        link: attachment.link,
      })) ??
      [],
  };

  if (existingFloorIndex >= 0) {
    floors.value.splice(existingFloorIndex, 1, floorData);
  } else {
    floors.value.push(floorData);
  }

  selectedFloorNumber.value = getDefaultFloorNumber();
  selectedSpace.value = [];
  currentSpaces.value = [];
  currentSpaceErrors.value = {};
  duplicateFloorSpaceError.value = '';
  updateData();
};

const editFloor = (index: number) => {
  const floor = floors.value[index];
  if (!floor) return;

  selectedFloorNumber.value = { ...floor.floorNumber };
  currentSpaces.value = floor.spaces.map((space) => ({
    ...space,
    space: { ...space.space },
    attachments: [...space.attachments],
  }));
  currentSpaceErrors.value = {};
  duplicateFloorSpaceError.value = '';

  floors.value.splice(index, 1);
  updateData();
};

const removeFloor = (index: number) => {
  floors.value.splice(index, 1);
  updateData();
};

const resetForm = () => {
  selectedFloorNumber.value = getDefaultFloorNumber();
  selectedSpace.value = [];
  currentSpaces.value = [];
  currentSpaceErrors.value = {};
  duplicateFloorSpaceError.value = '';
  floors.value = [];
  siteDescription.value = '';
  technicalGeneralNotes.value = '';
  inspectionRecommendations.value = '';
  updateData();
};

defineExpose({ resetForm });

watch(
  () => props.projectFloor,
  (projectFloor) => {
    if (!projectFloor) {
      selectedFloorNumber.value = getDefaultFloorNumber();
      selectedSpace.value = [];
      currentSpaces.value = [];
      currentSpaceErrors.value = {};
      duplicateFloorSpaceError.value = '';
      floors.value = [];
      siteDescription.value = '';
      technicalGeneralNotes.value = '';
      inspectionRecommendations.value = '';
      updateData();
      return;
    }

    siteDescription.value = projectFloor.site_description ?? '';
    technicalGeneralNotes.value = projectFloor.technical_general_notes ?? '';
    inspectionRecommendations.value = projectFloor.inspection_recommendations ?? '';

    const floorNumber =
      floorNumberOptions.value.find(
        (item) => Number(item.id) === Number(projectFloor.floor_number),
      ) ?? getDefaultFloorNumber();

    if (floorNumber) {
      floors.value = [
        {
          localId: Number(projectFloor.id ?? Date.now()),
          floorNumber,
          attachments: [],
          spaces: Array.isArray(projectFloor.spaces)
            ? projectFloor.spaces.map((item) => ({
              space: {
                id: Number(item.space?.id ?? item.space_id),
                title: item.space?.title ?? `#${item.space?.id ?? item.space_id}`,
              },
              length: String(item.length ?? ''),
              width: String(item.width ?? ''),
              height: String(item.height ?? ''),
              notes: item.notes ?? '',
              attachments: item.attachments ?? [],
            }))
            : [],
        },
      ];
    }

    updateData();
  },
  { immediate: true },
);

watch(
  () => [props.projectId, props.projectPreviewId],
  () => updateData(),
);

onMounted(async () => {
  await spaceController.fetchList(spaceParams);
});
</script>

<template>
  <div class="project-floor-form-page">
    <div class="project-floor-form-page__previews">
      <ProjectPreviewIndex @upcoming-change="handleUpcomingPreviewChange" />
    </div>

    <div
      class="project-floor-form-wrapper"
      :class="{
        'project-floor-form-wrapper--locked': floorFormLocked,
      }"
    >
      <div v-if="floorFormLocked" class="preview-gate" role="alert" aria-live="polite">
        <div class="preview-gate__backdrop" aria-hidden="true"></div>

        <section class="preview-gate__card">
          <span class="preview-gate__icon" aria-hidden="true">
            <i class="pi pi-calendar-clock"></i>
          </span>

          <div class="preview-gate__content">
            <span class="preview-gate__eyebrow">
              {{ $t('ProjectFloor.preview_not_started') }}
            </span>

            <h3>{{ $t('ProjectFloor.preview_pending_title') }}</h3>

            <p>
              {{
                $t('ProjectFloor.preview_pending_description', {
                  date: formatUpcomingPreviewDate,
                })
              }}
            </p>

            <div class="preview-gate__date">
              <i class="pi pi-clock" aria-hidden="true"></i>
              <span>{{ formatUpcomingPreviewDate }}</span>
            </div>

            <div class="preview-gate__actions">
              <button
                type="button"
                class="preview-gate__button preview-gate__button--primary"
                @click="allowAddingBeforePreview"
              >
                <i class="pi pi-unlock" aria-hidden="true"></i>
                {{ $t('ProjectFloor.continue_before_preview') }}
              </button>

              <router-link :to="{ name: 'project' }">
                <button
                  type="button"
                  class="preview-gate__button preview-gate__button--secondary"
                  @click="keepFormLocked"
                >
                  <i class="pi pi-calendar" aria-hidden="true"></i>
                  {{ $t('ProjectFloor.wait_for_preview') }}
                </button>
              </router-link>
            </div>

            <small>{{ $t('ProjectFloor.preview_pending_hint') }}</small>
          </div>
        </section>
      </div>

      <div class="project-floor-form-card">
        <header class="form-header">
          <div class="form-header__identity">
            <span class="form-header__icon" aria-hidden="true">
              <i class="pi pi-building"></i>
            </span>

            <div>
              <span class="form-header__eyebrow">{{ $t('ProjectFloor.form_title') }}</span>
              <h3>{{ $t('ProjectFloor.floor_data') }}</h3>
              <p>{{ $t('ProjectFloor.form_description') }}</p>
            </div>
          </div>

<<<<<<< HEAD
          <div class="notes-grid">
            <label class="note-field">
              <span>
                <!-- <span class="required-indicator" aria-hidden="true">*</span> -->
                {{ $t('ProjectFloor.site_description') }}
              </span>
              <textarea v-model="siteDescription" class="field-input"
                :class="{ 'field-input--invalid': validationErrors.site_description }"
                 aria-required="true" :aria-invalid="Boolean(validationErrors.site_description)"
                @input="updateData"></textarea>
              <small v-if="validationErrors.site_description" class="field-error" role="alert">
                {{ validationErrors.site_description }}
              </small>
            </label>

            <label class="note-field">
              <span>
                <!-- <span class="required-indicator" aria-hidden="true">*</span> -->
                {{ $t('ProjectFloor.technical_general_notes') }}
              </span>
              <textarea v-model="technicalGeneralNotes" class="field-input"
                :class="{ 'field-input--invalid': validationErrors.technical_general_notes }"
                 aria-required="true"
                :aria-invalid="Boolean(validationErrors.technical_general_notes)"
                @input="updateData"></textarea>
              <small v-if="validationErrors.technical_general_notes" class="field-error" role="alert">
                {{ validationErrors.technical_general_notes }}
              </small>
            </label>

            <label class="note-field">
              <span>
                <!-- <span class="required-indicator" aria-hidden="true">*</span> -->
                {{ $t('ProjectFloor.inspection_recommendations') }}
              </span>
              <textarea v-model="inspectionRecommendations" class="field-input"
                :class="{ 'field-input--invalid': validationErrors.inspection_recommendations }"
                 aria-required="true"
                :aria-invalid="Boolean(validationErrors.inspection_recommendations)"
                @input="updateData"></textarea>
              <small v-if="validationErrors.inspection_recommendations" class="field-error" role="alert">
                {{ validationErrors.inspection_recommendations }}
              </small>
            </label>
=======
          <div class="form-summary">
            <div>
              <span>{{ $t('ProjectFloor.floors') }}</span>
              <strong>{{ floors.length }}</strong>
            </div>
            <div>
              <span>{{ $t('ProjectFloor.selected_spaces') }}</span>
              <strong>{{ totalSpacesCount }}</strong>
            </div>
>>>>>>> origin/hotfix/new-design
          </div>
        </header>

        <div class="form-body" :class="{ disabled: loading }">
          <section class="section-card">
            <div class="section-head">
              <span class="section-head__icon" aria-hidden="true">
                <i class="pi pi-building"></i>
              </span>
              <div>
                <h4>{{ $t('ProjectFloor.floor_data') }}</h4>
                <p>{{ $t('ProjectFloor.floor_data_description') }}</p>
              </div>
            </div>

            <div class="section-card__body">
              <div class="picker-panel">
                <div class="picker-field">
                  <UpdatedCustomInputSelect
                    id="floor_number"
                    :label="$t('ProjectFloor.floor_number')"
                    :model-value="selectedFloorNumber"
                    :static-options="floorNumberOptions"
                    :placeholder="$t('ProjectFloor.floor_number_placeholder')"
                    @update:model-value="updateFloorNumber"
                  />
                </div>

                <div class="picker-field">
                  <UpdatedCustomInputSelect
                    id="space_id"
                    :label="$t('ProjectFloor.space')"
                    :model-value="selectedSpace"
                    :static-options="spaceOptions"
                    :placeholder="$t('ProjectFloor.space_placeholder')"
                    :type="2"
                    @update:model-value="updateSelectedSpace"
                  />
                </div>

                <button
                  type="button"
                  class="secondary-action-btn"
                  :disabled="!selectedSpace.length"
                  @click="addSpace"
                >
                  <i class="pi pi-plus" aria-hidden="true"></i>
                  {{ $t('ProjectFloor.add_space') }}
                </button>
              </div>

              <div v-if="currentSpaces.length" class="current-spaces">
                <article
                  v-for="(item, index) in currentSpaces"
                  :key="`${item.space.id}-${index}`"
                  class="space-row"
                >
                  <strong class="space-name">{{ item.space.title }}</strong>

                  <div v-for="field in dimensionFields" :key="field" class="space-dimension-field">
                    <input
                      v-model="item[field]"
                      class="mini-input"
                      :class="{ 'mini-input--invalid': currentSpaceError(index, field) }"
                      type="number"
                      min="0.01"
                      step="1"
                      required
                      :placeholder="$t(`ProjectFloor.${field}`)"
                      :aria-label="$t(`ProjectFloor.${field}`)"
                      aria-required="true"
                      :aria-invalid="Boolean(currentSpaceError(index, field))"
                      :aria-describedby="
                        currentSpaceError(index, field)
                          ? `floor-space-${index}-${field}-error`
                          : undefined
                      "
                      @input="clearCurrentSpaceError(index, field)"
                    />
                    <small
                      v-if="currentSpaceError(index, field)"
                      :id="`floor-space-${index}-${field}-error`"
                      class="space-dimension-field__error"
                      role="alert"
                    >
                      {{ currentSpaceError(index, field) }}
                    </small>
                  </div>
                  <input
                    v-model="item.notes"
                    class="mini-input"
                    type="text"
                    :placeholder="$t('ProjectFloor.notes')"
                  />

                  <label class="upload-chip">
                    <input
                      type="file"
                      multiple
                      @change="updateCurrentSpaceAttachments($event, index)"
                    />
                    <i class="pi pi-upload" aria-hidden="true"></i>
                    <span>{{ item.attachments.length || $t('ProjectFloor.choose_files') }}</span>
                  </label>

                  <button
                    type="button"
                    class="icon-btn icon-btn--danger"
                    :aria-label="$t('delete')"
                    @click="removeCurrentSpace(index)"
                  >
                    <i class="pi pi-trash" aria-hidden="true"></i>
                  </button>
                </article>
              </div>

              <button
                type="button"
                class="primary-action-btn"
                :disabled="!selectedFloorNumber || !currentSpaces.length"
                @click="addFloor"
              >
                <i class="pi pi-plus-circle" aria-hidden="true"></i>
                {{ $t('ProjectFloor.add_floor') }}
              </button>

              <p v-if="duplicateFloorSpaceError" class="floor-duplicate-error" role="alert">
                <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
                {{ duplicateFloorSpaceError }}
              </p>
            </div>
          </section>

          <section class="section-card">
            <div class="section-head section-head--between">
              <div class="section-head__start">
                <span class="section-head__icon" aria-hidden="true">
                  <i class="pi pi-list"></i>
                </span>
                <div>
                  <h4>{{ $t('ProjectFloor.saved_floors') }}</h4>
                  <p>{{ $t('ProjectFloor.selected_spaces_description') }}</p>
                </div>
              </div>
              <span class="count-badge">{{ floors.length }}</span>
            </div>

            <div class="section-card__body">
              <div v-if="!floors.length" class="empty-state">
                <span class="empty-state__icon" aria-hidden="true">
                  <i class="pi pi-building"></i>
                </span>
                <strong>{{ $t('ProjectFloor.no_spaces_title') }}</strong>
                <small>{{ $t('ProjectFloor.selected_spaces_description') }}</small>
              </div>

              <div v-else class="floors-list">
                <article
                  v-for="(floor, floorIndex) in floors"
                  :key="floor.localId"
                  class="floor-card"
                >
                  <header class="floor-card__head">
                    <div>
                      <span>{{ $t('ProjectFloor.floor_number') }}</span>
                      <strong>{{ floor.floorNumber.title }}</strong>
                    </div>

                    <div class="floor-card__actions">
                      <span class="count-badge">{{ floor.spaces.length }}</span>
                      <button
                        type="button"
                        class="icon-btn"
                        :aria-label="$t('edit')"
                        @click="editFloor(floorIndex)"
                      >
                        <i class="pi pi-pencil" aria-hidden="true"></i>
                      </button>
                      <button
                        type="button"
                        class="icon-btn icon-btn--danger"
                        :aria-label="$t('delete')"
                        @click="removeFloor(floorIndex)"
                      >
                        <i class="pi pi-trash" aria-hidden="true"></i>
                      </button>
                    </div>
                  </header>

                  <div class="floor-spaces-table">
                    <div class="floor-spaces-table__head">
                      <span>#</span>
                      <span>{{ $t('ProjectFloor.space') }}</span>
                      <span>{{ $t('ProjectFloor.length') }}</span>
                      <span>{{ $t('ProjectFloor.width') }}</span>
                      <span>{{ $t('ProjectFloor.height') }}</span>
                      <span>{{ $t('ProjectFloor.notes') }}</span>
                    </div>

                    <div
                      v-for="(space, spaceIndex) in floor.spaces"
                      :key="`${floor.localId}-${space.space.id}`"
                      class="floor-space-row"
                    >
                      <span>{{ spaceIndex + 1 }}</span>
                      <strong>{{ space.space.title }}</strong>
                      <span>{{ space.length || '-' }}</span>
                      <span>{{ space.width || '-' }}</span>
                      <span>{{ space.height || '-' }}</span>
                      <span>{{ space.notes || '-' }}</span>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <section class="section-card">
            <div class="section-head">
              <span class="section-head__icon" aria-hidden="true">
                <i class="pi pi-map-marker"></i>
              </span>
              <div>
                <h4>{{ $t('ProjectFloor.site_recommendations') }}</h4>
                <p>{{ $t('ProjectFloor.site_recommendations_description') }}</p>
              </div>
            </div>

            <div class="section-card__body">
              <div class="notes-grid">
                <label class="note-field">
                  <span>{{ $t('ProjectFloor.site_description') }}</span>
                  <textarea
                    v-model="siteDescription"
                    class="field-input"
                    @input="updateData"
                  ></textarea>
                </label>

                <label class="note-field">
                  <span>{{ $t('ProjectFloor.technical_general_notes') }}</span>
                  <textarea
                    v-model="technicalGeneralNotes"
                    class="field-input"
                    @input="updateData"
                  ></textarea>
                </label>

                <label class="note-field">
                  <span>{{ $t('ProjectFloor.inspection_recommendations') }}</span>
                  <textarea
                    v-model="inspectionRecommendations"
                    class="field-input"
                    @input="updateData"
                  ></textarea>
                </label>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.project-floor-form-page {
  display: flex;
  flex-direction: column;
  gap: var(--page-section-gap);
  padding: clamp(0.75rem, 2vw, 1.25rem);
  border-radius: var(--radius-xl);
  background: var(--bg-body);
}

.project-floor-form-page__previews {
  padding: var(--surface-padding);
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-xl);
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
}

.project-floor-form-wrapper {
  position: relative;
  isolation: isolate;
}

.project-floor-form-wrapper--locked {
  min-height: 520px;
}

.project-floor-form-wrapper--locked .project-floor-form-card {
  pointer-events: none;
  user-select: none;
  filter: blur(3px);
  opacity: 0.5;
}

.required-indicator,
.field-error {
  color: var(--danger);
}

.field-input--invalid {
  border-color: var(--danger);
}

.field-error {
  font-size: var(--xs-size);
}

.preview-gate {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: grid;
  min-height: 520px;
  padding: clamp(1rem, 3vw, 2rem);
  place-items: center;
}

.preview-gate__backdrop {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-lg);
  background: var(--black-alpha-45);
  backdrop-filter: blur(4px);
}

.preview-gate__card {
  position: relative;
  z-index: 1;
  display: flex;
  width: min(100%, 42rem);
  align-items: flex-start;
  gap: 1rem;
  padding: clamp(1.25rem, 3vw, 1.75rem);
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-xl);
  background: var(--bg-card);
  box-shadow: var(--shadow-xl);
  animation: preview-gate-enter var(--transition-slow) both;
}

.preview-gate__icon {
  display: grid;
  width: 3.5rem;
  height: 3.5rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid color-mix(in sRGB, var(--PrimaryColor) 18%, var(--border-weak));
  border-radius: var(--radius-lg);
  background: color-mix(in sRGB, var(--PrimaryColor) 9%, var(--bg-card));
  color: var(--PrimaryColor);
  font-size: 1.35rem;
}

.preview-gate__content {
  min-width: 0;
  flex: 1;

  h3 {
    margin: 0.3rem 0 0.5rem;
    color: var(--gray-900);
    font-family: 'Bold';
    font-size: var(--xl-size-base);
  }

  p {
    margin: 0;
    color: var(--gray-600);
    line-height: 1.7;
  }

  small {
    display: block;
    margin-top: 0.85rem;
    color: var(--gray-500);
    line-height: 1.6;
  }
}

.preview-gate__eyebrow {
  color: var(--PrimaryColor);
  font-family: 'Bold';
  font-size: var(--xs-size);
}

.preview-gate__date {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 1rem;
  padding: 0.55rem 0.8rem;
  border: 1px solid color-mix(in sRGB, var(--PrimaryColor) 18%, var(--border-weak));
  border-radius: var(--radius-full);
  background: color-mix(in sRGB, var(--PrimaryColor) 8%, var(--bg-card));
  color: var(--PrimaryColor);
  font-family: 'Bold';
  font-size: var(--sm-size);
}

.preview-gate__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 1.15rem;
}

.preview-gate__button {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding-inline: 1rem;
  border-radius: var(--control-radius);
  cursor: pointer;
  font-family: 'Medium';
  transition:
    color var(--transition-fast),
    border-color var(--transition-fast),
    background-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.preview-gate__button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.preview-gate__button:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.preview-gate__button--primary {
  border: 1px solid var(--PrimaryColor);
  background: var(--PrimaryColor);
  color: var(--standard-white);
}

.preview-gate__button--secondary {
  border: 1px solid var(--border-weak);
  background: var(--bg-card);
  color: var(--gray-700);
}

@keyframes preview-gate-enter {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.project-floor-form-card {
  display: flex;
  flex-direction: column;
  gap: var(--page-section-gap);
}

.form-header,
.form-header__identity,
.section-head,
.section-head__start,
.floor-card__head,
.floor-card__actions {
  display: flex;
  align-items: center;
}

.form-header {
  justify-content: space-between;
  gap: 1rem;
  padding: var(--surface-padding);
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-xl);
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);

  h3 {
    margin: 0.2rem 0;
    color: var(--gray-900);
    font-family: 'Bold';
    font-size: var(--xl-size-base);
    line-height: 1.4;
  }

  p {
    margin: 0;
    color: var(--gray-500);
    font-size: var(--sm-size);
    line-height: 1.55;
  }
}

.form-header__identity {
  min-width: 0;
  gap: 0.85rem;
}

.form-header__icon {
  display: grid;
  width: 3rem;
  height: 3rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid color-mix(in sRGB, var(--PrimaryColor) 18%, var(--border-weak));
  border-radius: var(--radius-md);
  background: color-mix(in sRGB, var(--PrimaryColor) 9%, var(--bg-card));
  color: var(--PrimaryColor);
  font-size: 1.25rem;
}

.form-header__eyebrow {
  color: var(--PrimaryColor);
  font-family: 'Medium';
  font-size: var(--xs-size);
}

.form-summary {
  display: flex;
  gap: 0.75rem;

  > div {
    min-width: 7.5rem;
    padding: 0.7rem 0.9rem;
    border: 1px solid color-mix(in sRGB, var(--PrimaryColor) 16%, var(--border-weak));
    border-radius: var(--radius-md);
    background: color-mix(in sRGB, var(--PrimaryColor) 6%, var(--bg-card));
    text-align: center;
  }

  span {
    display: block;
    color: var(--gray-500);
    font-size: var(--xs-size);
  }

  strong {
    display: block;
    margin-top: 0.25rem;
    color: var(--PrimaryColor);
    font-size: 1.2rem;
  }
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-body.disabled {
  pointer-events: none;
  opacity: 0.7;
}

.section-card {
  overflow: hidden;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-xl);
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
}

.section-head {
  gap: 0.75rem;
  min-height: 4.5rem;
  padding: 1rem var(--surface-padding);
  align-items: center;
  border-block-end: 1px solid
    color-mix(in sRGB, var(--PrimaryColor) 10%, var(--border-weak));
  background: color-mix(in sRGB, var(--PrimaryColor) 6%, var(--bg-card));
}

.section-head--between {
  justify-content: space-between;
  align-items: center;
}

.section-head__start {
  gap: 0.75rem;
  align-items: center;
}

.section-head h4 {
  margin: 0;
  color: var(--gray-900);
  font-family: 'Bold';
  font-size: var(--md-size);
  line-height: 1.4;
}

.section-head p {
  margin: 0.25rem 0 0;
  color: var(--gray-500);
  font-size: var(--xs-size);
  line-height: 1.5;
}

.section-head__icon {
  display: grid;
  width: 2.35rem;
  height: 2.35rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid color-mix(in sRGB, var(--PrimaryColor) 16%, var(--border-weak));
  border-radius: var(--radius-sm);
  background: color-mix(in sRGB, var(--PrimaryColor) 9%, var(--bg-card));
  color: var(--PrimaryColor);
}

.section-card__body {
  padding: var(--surface-padding);
}

.picker-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: end;
}

.picker-field:first-child {
  grid-column: 1 / -1;
}

.picker-field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  min-width: 0;
}

:deep(.picker-panel .input-select) {
  min-height: max(var(--control-height), 48px);
  border-radius: var(--control-radius);
  background: var(--bg-card);
}

:deep(.picker-panel .input-select:not(.p-disabled):hover) {
  border-color: var(--border-strong);
}

:deep(.picker-panel .input-select:not(.p-disabled).p-focus) {
  border-color: var(--PrimaryColor);
  box-shadow: var(--focus-ring);
}

.secondary-action-btn,
.primary-action-btn {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0 1rem;
  border-radius: var(--control-radius);
  cursor: pointer;
  font-family: 'Medium';
  transition:
    color var(--transition-fast),
    border-color var(--transition-fast),
    background-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.secondary-action-btn {
  border: 1px solid var(--PrimaryColor);
  background: var(--bg-card);
  color: var(--PrimaryColor);
}

.primary-action-btn {
  min-width: 10rem;
  margin-top: 1.25rem;
  border: 1px solid var(--PrimaryColor);
  background: var(--PrimaryColor);
  color: var(--standard-white);
}

.secondary-action-btn:hover:not(:disabled),
.primary-action-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.secondary-action-btn:hover:not(:disabled) {
  background: color-mix(in sRGB, var(--PrimaryColor) 8%, var(--bg-card));
}

.secondary-action-btn:focus-visible,
.primary-action-btn:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.secondary-action-btn:disabled,
.primary-action-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.current-spaces {
  display: grid;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.space-row {
  display: grid;
  grid-template-columns: 1.2fr repeat(4, 0.8fr) 1fr 44px;
  gap: 0.75rem;
  align-items: start;
  padding: 0.9rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-md);
  background: var(--bg-section);
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.space-row:hover {
  border-color: color-mix(in sRGB, var(--PrimaryColor) 34%, var(--border-weak));
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.space-name {
  display: flex;
  min-height: var(--control-height);
  align-items: center;
  overflow: hidden;
  color: var(--gray-800);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.space-dimension-field {
  min-width: 0;
}

.mini-input,
.field-input {
  width: 100%;
  min-height: 44px;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--control-radius);
  background: var(--bg-card);
  color: var(--gray-800);
  outline: none;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.mini-input:hover,
.field-input:hover {
  border-color: var(--border-strong);
}

.mini-input:focus,
.field-input:focus {
  border-color: var(--PrimaryColor);
  box-shadow: var(--focus-ring);
}

.mini-input--invalid {
  border-color: var(--danger);
}

.space-dimension-field__error {
  display: block;
  margin-top: 0.35rem;
  color: var(--danger);
  font-size: var(--xs-size);
  line-height: 1.35;
}

.upload-chip {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0 0.65rem;
  border: 1px dashed var(--border-weak);
  border-radius: var(--control-radius);
  background: var(--bg-section);
  color: var(--gray-600);
  cursor: pointer;
  transition:
    color var(--transition-fast),
    border-color var(--transition-fast),
    background-color var(--transition-fast);
}

.upload-chip:hover,
.upload-chip:focus-within {
  border-color: var(--PrimaryColor);
  background: color-mix(in sRGB, var(--PrimaryColor) 6%, var(--bg-card));
  color: var(--PrimaryColor);
}

.upload-chip input {
  display: none;
}

.icon-btn {
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-weak);
  border-radius: var(--control-radius);
  background: var(--bg-card);
  color: var(--PrimaryColor);
  cursor: pointer;
  transition:
    color var(--transition-fast),
    border-color var(--transition-fast),
    background-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.icon-btn:hover,
.icon-btn:focus-visible {
  border-color: var(--PrimaryColor);
  background: color-mix(in sRGB, var(--PrimaryColor) 8%, var(--bg-card));
  outline: none;
}

.icon-btn:focus-visible {
  box-shadow: var(--focus-ring);
}

.icon-btn--danger {
  color: var(--danger);
}

.icon-btn--danger:hover,
.icon-btn--danger:focus-visible {
  border-color: var(--danger);
  background: var(--danger-light);
}

.count-badge {
  display: inline-flex;
  min-width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in sRGB, var(--PrimaryColor) 16%, var(--border-weak));
  border-radius: var(--radius-full);
  background: color-mix(in sRGB, var(--PrimaryColor) 9%, var(--bg-card));
  color: var(--PrimaryColor);
  font-family: 'Bold';
}

.empty-state {
  display: grid;
  min-height: 11rem;
  padding: 2rem 1rem;
  place-items: center;
  align-content: center;
  gap: 0.45rem;
  border: 1px dashed var(--border-weak);
  border-radius: var(--radius-md);
  background: var(--bg-section);
  color: var(--gray-600);
  text-align: center;

  strong {
    color: var(--gray-800);
    font-family: 'Bold';
  }

  small {
    color: var(--gray-500);
  }
}

.empty-state__icon {
  display: grid;
  width: 3rem;
  height: 3rem;
  margin-bottom: 0.25rem;
  place-items: center;
  border-radius: var(--radius-full);
  background: color-mix(in sRGB, var(--PrimaryColor) 9%, var(--bg-card));
  color: var(--PrimaryColor);
  font-size: 1.25rem;
}

.floors-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.floor-card {
  overflow: hidden;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-md);
  background: var(--bg-card);
}

.floor-card__head {
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-block-end: 1px solid var(--border-weak);
  background: color-mix(in sRGB, var(--PrimaryColor) 5%, var(--bg-card));
}

.floor-card__head span {
  color: var(--gray-500);
  font-size: var(--xs-size);
}

.floor-card__head strong {
  display: block;
  margin-top: 0.2rem;
  color: var(--gray-900);
}

.floor-card__actions {
  gap: 0.5rem;
}

.floor-spaces-table__head,
.floor-space-row {
  display: grid;
  min-width: 46rem;
  grid-template-columns: 44px 1.2fr repeat(3, 0.8fr) 1.4fr;
  gap: 0.65rem;
  align-items: center;
  padding: 0.75rem 1rem;
}

.floor-spaces-table__head {
  background: var(--bg-section);
  color: var(--gray-600);
  font-family: 'Medium';
  font-size: var(--xs-size);
}

.floor-space-row {
  border-top: 1px solid var(--border-weak);
  color: var(--gray-700);
}

.floor-space-row strong {
  color: var(--gray-900);
}

.floor-spaces-table {
  overflow-x: auto;
  overscroll-behavior-inline: contain;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.note-field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.note-field span {
  color: var(--gray-700);
  font-family: 'Medium';
  font-size: var(--sm-size);
}

.note-field textarea {
  min-height: 120px;
  line-height: 1.65;
  resize: vertical;
}

.note-field:last-child {
  grid-column: 1 / -1;
}

.floor-duplicate-error {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0.85rem 0 0;
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--danger-alpha-15);
  border-radius: var(--radius-sm);
  background: var(--danger-light);
  color: var(--danger-dark);
  font-size: var(--sm-size);
}

@media (max-width: 1100px) {
  .space-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .space-name {
    grid-column: 1 / -1;
  }

  .space-row > .icon-btn {
    justify-self: end;
  }
}

@media (max-width: 768px) {
  .project-floor-form-page__previews,
  .form-header {
    padding: 1rem;
  }

  .project-floor-form-page {
    padding: 0.75rem;
  }

  .section-head,
  .section-card__body {
    padding: 1rem;
  }

  .form-header {
    align-items: stretch;
    flex-direction: column;
  }

  .form-summary {
    width: 100%;
  }

  .form-summary > div {
    flex: 1;
  }

  .picker-panel {
    grid-template-columns: 1fr;
  }

  .picker-field:first-child {
    grid-column: auto;
  }

  .secondary-action-btn,
  .primary-action-btn {
    width: 100%;
  }

  .space-row {
    grid-template-columns: 1fr;
  }

  .space-name {
    grid-column: auto;
  }

  .notes-grid {
    grid-template-columns: 1fr;
  }

  .note-field:last-child {
    grid-column: auto;
  }
}

@media (max-width: 640px) {
  .preview-gate {
    padding: 1rem;
  }

  .preview-gate__card {
    flex-direction: column;
    padding: 1.15rem;
  }

  .preview-gate__actions {
    flex-direction: column;
  }

  .preview-gate__button {
    width: 100%;
  }

  .form-header__identity {
    align-items: flex-start;
  }

  .form-header__icon {
    width: 2.6rem;
    height: 2.6rem;
  }

  .form-summary {
    flex-direction: column;
  }

  .form-summary > div {
    width: 100%;
  }

  .section-head,
  .section-head__start {
    gap: 0.55rem;
  }

  .section-head__icon {
    width: 2rem;
    height: 2rem;
  }

  .section-head--between {
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .preview-gate__card,
  .preview-gate__button,
  .secondary-action-btn,
  .primary-action-btn,
  .space-row,
  .mini-input,
  .field-input,
  .upload-chip,
  .icon-btn {
    animation: none;
    transition: none;
  }
}
</style>
