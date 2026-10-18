<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Dialog from 'primevue/dialog';

import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { getFloorNumberNameKey } from '@/modules/MainOrganization/ProjectFloor/core/constants/floor.number.enum';
import EditProjectFloorParams, {
  type EditSingleProjectFloorSpaceParams,
} from '@/modules/MainOrganization/ProjectFloor/core/params/edit.project.floor.params';
import ProjectFloorController from '@/modules/MainOrganization/ProjectFloor/presentation/controllers/project.floor.controller';

import type { FloorSpace, ProjectFloor } from './projectShow.types';

interface EditableFloorSpace {
  space_id: number;
  title: string;
  length: number | null;
  width: number | null;
  height: number | null;
  notes: string;
}

interface FloorUpdateRequest {
  params: EditProjectFloorParams;
  spaces: EditSingleProjectFloorSpaceParams[];
}

type DimensionField = 'length' | 'width' | 'height';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    floor: ProjectFloor | null;
    projectId?: number;
    projectPreviewId?: number;
  }>(),
  {
    projectId: undefined,
    projectPreviewId: undefined,
  },
);

const emit = defineEmits<{
  'update:modelValue': [visible: boolean];
  updated: [floor: ProjectFloor];
  updating: [value: boolean];
}>();

const { locale, t } = useI18n();
const projectFloorController = ProjectFloorController.getInstance();

const spaces = ref<EditableFloorSpace[]>([]);
const validationErrors = ref<Record<string, string>>({});
const updating = ref(false);

const toPositiveInteger = (value: unknown): number | undefined => {
  const numberValue = Number(value);

  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : undefined;
};

const toEditableDimension = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : null;
};

const getSpaceId = (space: FloorSpace): number => {
  return toPositiveInteger(space.space?.id) ?? toPositiveInteger(space.space_id) ?? 0;
};

const getSpaceTitle = (space: FloorSpace, spaceId: number): string => {
  if (typeof space.space?.name === 'string' && space.space.name.trim()) {
    return space.space.name;
  }

  if (typeof space.space?.title === 'string' && space.space.title.trim()) {
    return space.space.title;
  }

  if (Array.isArray(space.space?.title)) {
    const localizedTitle =
      space.space.title.find((translation) => translation.locale === locale.value)?.title ??
      space.space.title.find((translation) => translation.locale === 'en')?.title ??
      space.space.title.find((translation) => translation.title)?.title;

    if (localizedTitle) {
      return localizedTitle;
    }
  }

  return spaceId > 0 ? `#${spaceId}` : '-';
};

const resetForm = (): void => {
  spaces.value = [];
  validationErrors.value = {};
};

const populateForm = (floor: ProjectFloor): void => {
  spaces.value = (floor.spaces ?? []).map((space) => {
    const spaceId = getSpaceId(space);

    return {
      space_id: spaceId,
      title: getSpaceTitle(space, spaceId),
      length: toEditableDimension(space.length),
      width: toEditableDimension(space.width),
      height: toEditableDimension(space.height),
      notes: typeof space.notes === 'string' ? space.notes : '',
    };
  });
  validationErrors.value = {};
};

watch(
  () => props.floor,
  (floor) => {
    if (!floor) {
      resetForm();
      return;
    }

    populateForm(floor);
  },
  { immediate: true },
);

const projectFloorId = computed(() => toPositiveInteger(props.floor?.id));
const resolvedProjectId = computed(
  () => toPositiveInteger(props.projectId) ?? toPositiveInteger(props.floor?.project_id),
);
const resolvedProjectPreviewId = computed(
  () =>
    toPositiveInteger(props.projectPreviewId) ??
    toPositiveInteger(props.floor?.project_preview?.id) ??
    toPositiveInteger(props.floor?.project_preview_id),
);
const floorTitle = computed(() => {
  if (props.floor?.floor_number === null || props.floor?.floor_number === undefined) {
    return '-';
  }

  return t(getFloorNumberNameKey(props.floor.floor_number));
});

const errorKey = (spaceIndex: number, field: string): string => {
  return `spaces.${spaceIndex}.${field}`;
};

const fieldError = (spaceIndex: number, field: string): string | undefined => {
  return validationErrors.value[errorKey(spaceIndex, field)];
};

const clearFieldError = (spaceIndex: number, field: string): void => {
  const fieldKey = errorKey(spaceIndex, field);

  if (!validationErrors.value[fieldKey]) {
    return;
  }

  const nextErrors = { ...validationErrors.value };
  delete nextErrors[fieldKey];
  validationErrors.value = nextErrors;
};

const updateDimension = (spaceIndex: number, field: DimensionField, event: Event): void => {
  const editableSpace = spaces.value[spaceIndex];

  if (!editableSpace) {
    return;
  }

  const inputValue = (event.target as HTMLInputElement).value;
  editableSpace[field] = inputValue === '' ? null : toEditableDimension(inputValue);
  clearFieldError(spaceIndex, field);
};

const validateForm = (): boolean => {
  const errors: Record<string, string> = {};

  if (!projectFloorId.value) {
    errors.project_floor_id = t('ProjectFloor.validation_floor_id');
  }
  if (!resolvedProjectId.value) {
    errors.project_id = t('ProjectFloor.validation_project_id');
  }
  if (!resolvedProjectPreviewId.value) {
    errors.project_preview_id = t('ProjectFloor.validation_project_preview_id');
  }
  if (spaces.value.length === 0) {
    errors.spaces = t('ProjectFloor.no_spaces_found');
  }

  spaces.value.forEach((space, spaceIndex) => {
    if (!toPositiveInteger(space.space_id)) {
      errors[errorKey(spaceIndex, 'space_id')] = t('ProjectFloor.validation_space_id');
    }

    (['length', 'width', 'height'] as const).forEach((field) => {
      const value = space[field];

      if (value === null || !Number.isFinite(value) || value <= 0) {
        errors[errorKey(spaceIndex, field)] = t('ProjectFloor.validation_dimension_positive', {
          field: t(`ProjectFloor.${field}`),
        });
      }
    });
  });

  validationErrors.value = errors;

  return Object.keys(errors).length === 0;
};

const buildValidatedSpaces = (): EditSingleProjectFloorSpaceParams[] | null => {
  const requestSpaces: EditSingleProjectFloorSpaceParams[] = [];

  for (const space of spaces.value) {
    if (
      !toPositiveInteger(space.space_id) ||
      space.length === null ||
      space.width === null ||
      space.height === null ||
      space.length <= 0 ||
      space.width <= 0 ||
      space.height <= 0
    ) {
      return null;
    }

    requestSpaces.push({
      space_id: space.space_id,
      length: space.length,
      width: space.width,
      height: space.height,
      notes: space.notes.trim() || null,
    });
  }

  return requestSpaces;
};

const mapServerValidationErrors = (errors?: Record<string, string[]>): Record<string, string> => {
  if (!errors) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [field, messages[0] ?? '']),
  );
};

const buildUpdatedFloor = (
  floor: ProjectFloor,
  requestSpaces: EditSingleProjectFloorSpaceParams[],
): ProjectFloor => {
  const editedSpaces = new Map(requestSpaces.map((space) => [space.space_id, space]));

  return {
    ...floor,
    spaces: (floor.spaces ?? []).map((space) => {
      const editedSpace = editedSpaces.get(getSpaceId(space));

      if (!editedSpace) {
        return space;
      }

      return {
        ...space,
        length: editedSpace.length,
        width: editedSpace.width,
        height: editedSpace.height,
        notes: editedSpace.notes,
      };
    }),
  };
};

const buildFloorUpdateRequest = (): FloorUpdateRequest | null => {
  const requestSpaces = buildValidatedSpaces();
  const floorId = projectFloorId.value;
  const projectId = resolvedProjectId.value;
  const projectPreviewId = resolvedProjectPreviewId.value;

  if (!requestSpaces || !floorId || !projectId || !projectPreviewId) {
    return null;
  }

  const params = new EditProjectFloorParams({
    project_floor_id: floorId,
    project_id: projectId,
    project_preview_id: projectPreviewId,
    spaces: requestSpaces,
  });
  const paramsValidation = params.validate();

  if (!paramsValidation.isValid) {
    params.validateOrThrow();
    return null;
  }

  return { params, spaces: requestSpaces };
};

const updateSelectedFloor = async (
  floor: ProjectFloor,
  request: FloorUpdateRequest,
): Promise<ProjectFloor | null> => {
  const updateState = await projectFloorController.updateWithoutNavigation(request.params);

  if (updateState instanceof DataSuccess) {
    return buildUpdatedFloor(floor, request.spaces);
  }

  if (updateState?.hasError) {
    validationErrors.value = {
      ...validationErrors.value,
      ...mapServerValidationErrors(updateState.error?.validationErrors),
    };
  }

  return null;
};

const submitFloorUpdate = async (): Promise<void> => {
  if (!props.floor || updating.value || !validateForm()) {
    return;
  }

  const floorToUpdate = props.floor;
  const updateRequest = buildFloorUpdateRequest();

  if (!updateRequest) {
    return;
  }

  updating.value = true;
  emit('updating', true);

  let updatedFloor: ProjectFloor | null = null;

  try {
    updatedFloor = await updateSelectedFloor(floorToUpdate, updateRequest);
  } finally {
    updating.value = false;
    emit('updating', false);
  }

  if (!updatedFloor) {
    return;
  }

  emit('updated', updatedFloor);
  emit('update:modelValue', false);
  resetForm();
};

const handleVisibilityChange = (visible: boolean): void => {
  if (updating.value) {
    return;
  }

  emit('update:modelValue', visible);

  if (!visible) {
    resetForm();
  }
};
</script>

<template>
  <Dialog
    :visible="modelValue"
    modal
    append-to="body"
    :closable="!updating"
    :dismissable-mask="!updating"
    :draggable="false"
    :style="{ width: '60rem', maxWidth: 'calc(100vw - 2rem)' }"
    class="project-floor-edit-dialog workspace-dialog"
    @update:visible="handleVisibilityChange"
  >
    <template #header>
      <div class="project-floor-edit-dialog__header">
        <span class="project-floor-edit-dialog__header-icon" aria-hidden="true">
          <i class="pi pi-building-columns" />
        </span>

        <div>
          <h3>{{ $t('ProjectFloor.edit_floor_dialog_title') }}</h3>
          <p>{{ $t('ProjectFloor.edit_floor_dialog_description') }}</p>
        </div>

        <span class="project-floor-edit-dialog__floor">{{ floorTitle }}</span>
      </div>
    </template>

    <StandardFormLayout
      as="form"
      embedded
      class="project-floor-edit-dialog__form"
      @submit.prevent="submitFloorUpdate"
    >
      <div
        v-if="
          validationErrors.project_floor_id ||
          validationErrors.project_id ||
          validationErrors.project_preview_id
        "
        class="project-floor-edit-dialog__context-error"
        role="alert"
      >
        <i class="pi pi-exclamation-circle" aria-hidden="true" />
        <span>
          {{
            validationErrors.project_floor_id ||
            validationErrors.project_id ||
            validationErrors.project_preview_id
          }}
        </span>
      </div>

      <div class="project-floor-edit-dialog__body">
        <div v-if="!spaces.length" class="project-floor-edit-dialog__empty">
          <i class="pi pi-inbox" aria-hidden="true" />
          <p>{{ $t('ProjectFloor.no_spaces_found') }}</p>
        </div>

        <article
          v-for="(space, spaceIndex) in spaces"
          :key="`${space.space_id}-${spaceIndex}`"
          class="project-floor-edit-dialog__space"
        >
          <header class="project-floor-edit-dialog__space-header">
            <span>{{ spaceIndex + 1 }}</span>
            <div>
              <small>{{ $t('ProjectFloor.space') }}</small>
              <strong>{{ space.title }}</strong>
            </div>
          </header>

          <p
            v-if="fieldError(spaceIndex, 'space_id')"
            class="project-floor-edit-dialog__field-error"
            role="alert"
          >
            {{ fieldError(spaceIndex, 'space_id') }}
          </p>

          <div class="project-floor-edit-dialog__fields">
            <label v-for="field in ['length', 'width', 'height'] as const" :key="field">
              <span>{{ $t(`ProjectFloor.${field}`) }}</span>
              <input
                :id="`floor-space-${spaceIndex}-${field}`"
                class="project-floor-edit-dialog__input workspace-control"
                type="number"
                min="0.01"
                step="1"
                inputmode="decimal"
                :value="space[field] ?? ''"
                :disabled="updating"
                :aria-invalid="Boolean(fieldError(spaceIndex, field))"
                :aria-describedby="
                  fieldError(spaceIndex, field)
                    ? `floor-space-${spaceIndex}-${field}-error`
                    : undefined
                "
                @input="updateDimension(spaceIndex, field, $event)"
              />
              <small
                v-if="fieldError(spaceIndex, field)"
                :id="`floor-space-${spaceIndex}-${field}-error`"
                class="project-floor-edit-dialog__field-error"
              >
                {{ fieldError(spaceIndex, field) }}
              </small>
            </label>

            <label class="project-floor-edit-dialog__notes-field">
              <span>{{ $t('ProjectFloor.notes') }}</span>
              <textarea
                v-model="space.notes"
                class="project-floor-edit-dialog__input workspace-control"
                rows="3"
                :disabled="updating"
                :placeholder="$t('ProjectFloor.notes_placeholder')"
              />
            </label>
          </div>
        </article>
      </div>

      <p v-if="validationErrors.spaces" class="project-floor-edit-dialog__field-error" role="alert">
        {{ validationErrors.spaces }}
      </p>
    </StandardFormLayout>

    <template #footer>
      <div class="project-floor-edit-dialog__actions">
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="updating"
          @click="handleVisibilityChange(false)"
        >
          {{ $t('cancel') }}
        </button>

        <button
          type="button"
          class="btn btn-primary"
          :disabled="updating || !floor"
          @click="submitFloorUpdate"
        >
          <i v-if="updating" class="pi pi-spinner pi-spin" aria-hidden="true" />
          {{ $t('ProjectFloor.save_changes') }}
        </button>
      </div>
    </template>
  </Dialog>
</template>

<style scoped lang="scss">
.project-floor-edit-dialog__header,
.project-floor-edit-dialog__space-header,
.project-floor-edit-dialog__actions,
.project-floor-edit-dialog__context-error {
  display: flex;
  align-items: center;
}

.project-floor-edit-dialog__header {
  width: 100%;
  min-width: 0;
  gap: 0.85rem;
}

.project-floor-edit-dialog__header h3,
.project-floor-edit-dialog__header p,
.project-floor-edit-dialog__empty p {
  margin: 0;
}

.project-floor-edit-dialog__header h3 {
  color: var(--gray-900);
  font-family: 'Bold';
}

.project-floor-edit-dialog__header p {
  margin-block-start: 0.25rem;
  color: var(--gray-600);
  font-size: var(--sm-size);
}

.project-floor-edit-dialog__header-icon {
  display: inline-flex;
  width: 2.75rem;
  height: 2.75rem;
  flex: 0 0 2.75rem;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: var(--PrimaryColor-light);
  color: var(--PrimaryColor);
}

.project-floor-edit-dialog__floor {
  flex: 0 0 auto;
  padding: 0.35rem 0.7rem;
  margin-inline-start: auto;
  border-radius: var(--radius-full);
  background: var(--PrimaryColor-light);
  color: var(--PrimaryColor);
  font-family: 'Medium';
  white-space: nowrap;
}

.project-floor-edit-dialog__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.project-floor-edit-dialog__body {
  display: flex;
  max-height: min(65vh, 45rem);
  overflow-y: auto;
  flex-direction: column;
  gap: 1rem;
  padding-inline-end: 0.25rem;
}

.project-floor-edit-dialog__space {
  padding: 1rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-lg);
  background: var(--BgWhite);
}

.project-floor-edit-dialog__space-header {
  gap: 0.75rem;
  margin-block-end: 1rem;
}

.project-floor-edit-dialog__space-header > span {
  display: inline-flex;
  width: 2.25rem;
  height: 2.25rem;
  flex: 0 0 2.25rem;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: var(--PrimaryColor-light);
  color: var(--PrimaryColor);
  font-family: 'Bold';
}

.project-floor-edit-dialog__space-header small,
.project-floor-edit-dialog__space-header strong {
  display: block;
}

.project-floor-edit-dialog__space-header small,
.project-floor-edit-dialog__fields label > span {
  color: var(--gray-600);
  font-size: var(--xs-size);
}

.project-floor-edit-dialog__space-header strong {
  margin-block-start: 0.15rem;
  color: var(--gray-900);
  font-family: 'Bold';
}

.project-floor-edit-dialog__fields {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
}

.project-floor-edit-dialog__fields label {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.4rem;
}

.project-floor-edit-dialog__notes-field {
  grid-column: 1 / -1;
}

.project-floor-edit-dialog__input {
  width: 100%;
  min-height: 2.75rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid var(--border-strong);
  border-radius: var(--bh-radius-control);
  background: var(--BgWhite);
  color: var(--gray-900);
  font: inherit;
}

textarea.project-floor-edit-dialog__input {
  min-height: 5.5rem;
  resize: vertical;
}

.project-floor-edit-dialog__input:focus-visible {
  border-color: var(--PrimaryColor);
  outline: 2px solid var(--PrimaryColor-light);
  outline-offset: 1px;
}

.project-floor-edit-dialog__input[aria-invalid='true'] {
  border-color: var(--danger);
}

.project-floor-edit-dialog__field-error {
  margin: 0;
  color: var(--danger);
  font-size: var(--xs-size);
}

.project-floor-edit-dialog__context-error {
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid var(--danger-light);
  border-radius: var(--radius-md);
  background: var(--danger-light);
  color: var(--danger-dark);
}

.project-floor-edit-dialog__empty {
  display: flex;
  min-height: 10rem;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.75rem;
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-lg);
  color: var(--gray-600);
  text-align: center;
}

.project-floor-edit-dialog__empty i {
  color: var(--PrimaryColor);
  font-size: 2rem;
}

.project-floor-edit-dialog__actions {
  width: 100%;
  justify-content: flex-end;
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .project-floor-edit-dialog__header {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .project-floor-edit-dialog__floor {
    width: 100%;
    margin-inline-start: 0;
    text-align: center;
  }

  .project-floor-edit-dialog__fields {
    grid-template-columns: minmax(0, 1fr);
  }

  .project-floor-edit-dialog__actions {
    align-items: stretch;
    flex-direction: column-reverse;
  }

  .project-floor-edit-dialog__actions .btn {
    width: 100%;
  }
}
</style>
