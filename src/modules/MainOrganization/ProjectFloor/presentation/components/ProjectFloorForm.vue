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
      loading?: boolean;
      isEdit?: boolean;
      validationErrors?: Record<string, string>;
    }>(),
    {
      projectFloor: undefined,
      projectId: undefined,
      projectPreviewId: undefined,
      loading: false,
      isEdit: false,
      validationErrors: () => ({}),
    },
  );

  const { t } = useI18n();

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

  type LocalFloor = {
    localId: number;
    floorNumber: TitleInterface<FloorNumber>;
    spaces: SpaceRow[];
    attachments: ProjectFloorAttachmentParams[];
  };

  const selectedFloorNumber = ref<TitleInterface<FloorNumber> | null>(null);
  const selectedSpace = ref<TitleInterface<number>[]>([]);
  const currentSpaces = ref<SpaceRow[]>([]);
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
      length: Number(item.length || 0),
      width: Number(item.width || 0),
      height: Number(item.height || 0),
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
  };

  const updateSelectedSpace = (value: TitleInterface<number>[] | TitleInterface<number> | null) => {
    if (!value) {
      selectedSpace.value = [];
      return;
    }

    selectedSpace.value = Array.isArray(value) ? value : [value];
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
  };

  const removeCurrentSpace = (index: number) => {
    currentSpaces.value.splice(index, 1);
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
    if (!selectedFloorNumber.value || !currentSpaces.value.length) return;

    const existingFloorIndex = floors.value.findIndex(
      (floor) => Number(floor.floorNumber.id) === Number(selectedFloorNumber.value?.id),
    );

    const floorData: LocalFloor = {
      localId: existingFloorIndex >= 0 ? floors.value[existingFloorIndex].localId : Date.now(),
      floorNumber: { ...selectedFloorNumber.value },
      spaces: currentSpaces.value.map((space) => ({
        ...space,
        space: { ...space.space },
        attachments: [...space.attachments],
      })),
      attachments: [],
    };

    if (existingFloorIndex >= 0) {
      floors.value.splice(existingFloorIndex, 1, floorData);
    } else {
      floors.value.push(floorData);
    }

    selectedFloorNumber.value = getDefaultFloorNumber();
    selectedSpace.value = [];
    currentSpaces.value = [];
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
  <ProjectPreviewIndex />

  <div class="project-floor-form-card">
    <header class="form-header">
      <div>
        <span class="form-header__eyebrow">{{ $t('ProjectFloor.form_title') }}</span>
        <h3>{{ $t('ProjectFloor.floor_data') }}</h3>
        <p>{{ $t('ProjectFloor.form_description') }}</p>
      </div>

      <div class="form-summary">
        <div>
          <span>{{ $t('ProjectFloor.floors') }}</span>
          <strong>{{ floors.length }}</strong>
        </div>
        <div>
          <span>{{ $t('ProjectFloor.selected_spaces') }}</span>
          <strong>{{ totalSpacesCount }}</strong>
        </div>
      </div>
    </header>

    <div class="form-body" :class="{ disabled: loading }">
      <section class="section-card">
        <div class="section-head">
          <span class="section-head__icon">🏢</span>
          <div>
            <h4>{{ $t('ProjectFloor.floor_data') }}</h4>
            <p>{{ $t('ProjectFloor.floor_data_description') }}</p>
          </div>
        </div>

        <div class="picker-panel">
          <div class="picker-field">
            <label class="field-label">{{ $t('ProjectFloor.floor_number') }}</label>
            <UpdatedCustomInputSelect
              id="floor_number"
              :model-value="selectedFloorNumber"
              :static-options="floorNumberOptions"
              :placeholder="$t('ProjectFloor.floor_number_placeholder')"
              @update:model-value="updateFloorNumber"
            />
          </div>

          <div class="picker-field">
            <label class="field-label">{{ $t('ProjectFloor.space') }}</label>
            <UpdatedCustomInputSelect
              id="space_id"
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
            <i class="pi pi-plus"></i>
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

            <input
              v-model="item.length"
              class="mini-input"
              type="number"
              min="0"
              step="0.01"
              :placeholder="$t('ProjectFloor.length')"
            />
            <input
              v-model="item.width"
              class="mini-input"
              type="number"
              min="0"
              step="0.01"
              :placeholder="$t('ProjectFloor.width')"
            />
            <input
              v-model="item.height"
              class="mini-input"
              type="number"
              min="0"
              step="0.01"
              :placeholder="$t('ProjectFloor.height')"
            />
            <input
              v-model="item.notes"
              class="mini-input"
              type="text"
              :placeholder="$t('ProjectFloor.notes')"
            />

            <label class="upload-chip">
              <input type="file" multiple @change="updateCurrentSpaceAttachments($event, index)" />
              <i class="pi pi-upload"></i>
              <span>{{ item.attachments.length || $t('ProjectFloor.choose_files') }}</span>
            </label>

            <button
              type="button"
              class="icon-btn icon-btn--danger"
              @click="removeCurrentSpace(index)"
            >
              <i class="pi pi-trash"></i>
            </button>
          </article>
        </div>

        <button
          type="button"
          class="primary-action-btn"
          :disabled="!selectedFloorNumber || !currentSpaces.length"
          @click="addFloor"
        >
          <i class="pi pi-plus-circle"></i>
          {{ $t('ProjectFloor.add_floor') }}
        </button>
      </section>

      <section class="section-card">
        <div class="section-head section-head--between">
          <div class="section-head__start">
            <span class="section-head__icon">📚</span>
            <div>
              <h4>{{ $t('ProjectFloor.saved_floors') }}</h4>
              <p>{{ $t('ProjectFloor.selected_spaces_description') }}</p>
            </div>
          </div>
          <span class="count-badge">{{ floors.length }}</span>
        </div>

        <div v-if="!floors.length" class="empty-state">
          {{ $t('ProjectFloor.no_spaces_title') }}
        </div>

        <div v-else class="floors-list">
          <article v-for="(floor, floorIndex) in floors" :key="floor.localId" class="floor-card">
            <header class="floor-card__head">
              <div>
                <span>{{ $t('ProjectFloor.floor_number') }}</span>
                <strong>{{ floor.floorNumber.title }}</strong>
              </div>

              <div class="floor-card__actions">
                <span class="count-badge">{{ floor.spaces.length }}</span>
                <button type="button" class="icon-btn" @click="editFloor(floorIndex)">
                  <i class="pi pi-pencil"></i>
                </button>
                <button
                  type="button"
                  class="icon-btn icon-btn--danger"
                  @click="removeFloor(floorIndex)"
                >
                  <i class="pi pi-trash"></i>
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
      </section>

      <section class="section-card">
        <div class="section-head">
          <span class="section-head__icon">📝</span>
          <div>
            <h4>{{ $t('ProjectFloor.site_recommendations') }}</h4>
            <p>{{ $t('ProjectFloor.site_recommendations_description') }}</p>
          </div>
        </div>

        <div class="notes-grid">
          <label class="note-field">
            <span>{{ $t('ProjectFloor.site_description') }}</span>
            <textarea v-model="siteDescription" class="field-input" @input="updateData"></textarea>
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
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .project-floor-form-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem;
    border-radius: 24px;
    background: var(--BgWhite);
  }

  .form-header,
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
    padding: 1.25rem;
    border: 1px solid var(--border-weak);
    border-radius: 20px;
    background: var(--BgWhite);

    h3 {
      margin: 0.35rem 0;
      font-family: 'Bold';
    }

    p {
      margin: 0;
      color: var(--gray-5);
    }
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
      min-width: 110px;
      padding: 0.75rem;
      border-radius: 16px;
      background: var(--PrimaryColor-light);
      text-align: center;
    }

    span {
      display: block;
      color: var(--gray-5);
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
    padding: 1rem;
    border: 1px solid var(--border-weak);
    border-radius: 20px;
    background: var(--BgWhite);
  }

  .section-head {
    gap: 0.75rem;
    margin-bottom: 1rem;
    align-items: flex-start;
  }

  .section-head--between {
    justify-content: space-between;
    align-items: center;
  }

  .section-head__start {
    gap: 0.75rem;
    align-items: flex-start;
  }

  .section-head h4 {
    margin: 0;
    font-family: 'Bold';
  }

  .section-head p {
    margin: 0.25rem 0 0;
    color: var(--gray-5);
    font-size: var(--xs-size);
  }

  .section-head__icon {
    display: inline-flex;
    width: 42px;
    height: 42px;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    background: var(--PrimaryColor-light);
  }

  .picker-panel {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 0.75rem;
    align-items: end;
  }

  .picker-field {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    min-width: 0;
  }

  .field-label {
    color: var(--gray-6);
    font-family: 'Medium';
  }

  .secondary-action-btn,
  .primary-action-btn {
    display: inline-flex;
    min-height: 46px;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0 1rem;
    border: 0;
    border-radius: 14px;
    cursor: pointer;
    font-family: 'Medium';
  }

  .secondary-action-btn {
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
  }

  .primary-action-btn {
    width: 100%;
    margin-top: 1rem;
    background: var(--PrimaryColor);
    color: #fff;
  }

  .secondary-action-btn:disabled,
  .primary-action-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .current-spaces {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    margin-top: 1rem;
  }

  .space-row {
    display: grid;
    grid-template-columns: 1.2fr repeat(4, 0.8fr) 1fr 44px;
    gap: 0.6rem;
    align-items: center;
    padding: 0.75rem;
    border: 1px solid var(--border-weak);
    border-radius: 16px;
  }

  .space-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mini-input,
  .field-input {
    width: 100%;
    min-height: 44px;
    padding: 0.65rem 0.75rem;
    border: 1px solid var(--border-weak);
    border-radius: 12px;
    background: var(--BgWhite);
    outline: none;
  }

  .upload-chip {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0 0.65rem;
    border: 1px dashed var(--border-weak);
    border-radius: 12px;
    cursor: pointer;
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
    border-radius: 10px;
    background: var(--BgWhite);
    color: var(--PrimaryColor);
    cursor: pointer;
  }

  .icon-btn--danger {
    color: var(--Red);
  }

  .count-badge {
    display: inline-flex;
    min-width: 36px;
    height: 36px;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
    font-family: 'Bold';
  }

  .empty-state {
    padding: 2rem;
    border: 1px dashed var(--border-weak);
    border-radius: 16px;
    color: var(--gray-5);
    text-align: center;
  }

  .floors-list {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .floor-card {
    overflow: hidden;
    border: 1px solid var(--border-weak);
    border-radius: 16px;
  }

  .floor-card__head {
    justify-content: space-between;
    gap: 1rem;
    padding: 0.85rem 1rem;
    background: var(--PrimaryColor-light);
  }

  .floor-card__head span {
    display: block;
    color: var(--gray-5);
    font-size: var(--xs-size);
  }

  .floor-card__head strong {
    display: block;
    margin-top: 0.2rem;
  }

  .floor-card__actions {
    gap: 0.5rem;
  }

  .floor-spaces-table__head,
  .floor-space-row {
    display: grid;
    grid-template-columns: 44px 1.2fr repeat(3, 0.8fr) 1.4fr;
    gap: 0.65rem;
    align-items: center;
    padding: 0.75rem 1rem;
  }

  .floor-spaces-table__head {
    background: var(--bg-main);
    color: var(--gray-5);
    font-size: var(--xs-size);
  }

  .floor-space-row {
    border-top: 1px solid var(--border-weak);
  }

  .notes-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .note-field {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  .note-field span {
    color: var(--gray-6);
    font-family: 'Medium';
  }

  .note-field textarea {
    min-height: 120px;
    resize: vertical;
  }

  @media (max-width: 1100px) {
    .space-row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .notes-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
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

    .space-row {
      grid-template-columns: 1fr;
    }

    .floor-spaces-table__head {
      display: none;
    }

    .floor-space-row {
      grid-template-columns: 1fr;
    }
  }
</style>
