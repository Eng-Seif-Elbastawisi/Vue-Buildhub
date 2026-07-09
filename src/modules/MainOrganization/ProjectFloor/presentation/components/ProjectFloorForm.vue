<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';

  import AddProjectFloorParams, {
    type ProjectFloorSpaceParams,
    type ProjectFloorSpaceAttachmentParams,
  } from '../../core/params/add.project.floor.params';
  import { FloorNumber } from '../../core/constants/floor.number.enum';

  import ProjectPreviewIndex from '../../../../../modules/MainOrganization/Project/presentation/components/project_preview/ProjectPreviewIndex.vue';

  import IndexSpaceParams from '@/modules/shared/Space/core/params/index.space.params';
  import SpaceController from '@/modules/shared/Space/presentation/controllers/space.controller';
  import type ProjectFloorModel from '../../core/models/project.floor.model.ts';

  const emit = defineEmits<{
    updateData: [params: AddProjectFloorParams];
  }>();

  const props = defineProps<{
    projectFloor?: ProjectFloorModel;
    projectId?: number;
    projectPreviewId?: number;
    loading?: boolean;
    isEdit?: boolean;
  }>();

  const { t } = useI18n();

  const spaceController = SpaceController.getInstance();
  const spaceParams = new IndexSpaceParams('', 1, 100, 0);

  const selectedFloorNumber = ref<TitleInterface<FloorNumber> | null>(null);
  const selectedSpace = ref<TitleInterface<number>[]>([]);

  const siteDescription = ref<string>('');
  const technicalGeneralNotes = ref<string>('');
  const inspectionRecommendations = ref<string>('');

  type SpaceRow = {
    space: TitleInterface<number>;
    length: string;
    width: string;
    height: string;
    notes: string;
    attachments: ProjectFloorSpaceAttachmentParams[];
  };

  const spaces = ref<SpaceRow[]>([]);

  const floorNumberOptions = computed<TitleInterface<FloorNumber>[]>(() => [
    {
      id: FloorNumber.BASEMENT,
      title: t('project.BASEMENT'),
    },
    {
      id: FloorNumber.GROUND_FLOOR,
      title: t('project.GROUND_FLOOR'),
    },
    {
      id: FloorNumber.FIRST_FLOOR,
      title: t('project.FIRST_FLOOR'),
    },
    {
      id: FloorNumber.SECOND_FLOOR,
      title: t('project.SECOND_FLOOR'),
    },
    {
      id: FloorNumber.THIRD_FLOOR,
      title: t('project.THIRD_FLOOR'),
    },
    {
      id: FloorNumber.FOURTH_FLOOR,
      title: t('project.FOURTH_FLOOR'),
    },
    {
      id: FloorNumber.FIFTH_FLOOR,
      title: t('project.FIFTH_FLOOR'),
    },
    {
      id: FloorNumber.SIXTH_FLOOR,
      title: t('project.SIXTH_FLOOR'),
    },
    {
      id: FloorNumber.SEVENTH_FLOOR,
      title: t('project.SEVENTH_FLOOR'),
    },
    {
      id: FloorNumber.EIGHTH_FLOOR,
      title: t('project.EIGHTH_FLOOR'),
    },
    {
      id: FloorNumber.NINTH_FLOOR,
      title: t('project.NINTH_FLOOR'),
    },
    {
      id: FloorNumber.TENTH_FLOOR,
      title: t('project.TENTH_FLOOR'),
    },
  ]);

  const spaceOptions = computed<TitleInterface<number>[]>(() => {
    const data = ((spaceController.listState.value as any)?.data ?? []) as any[];

    return data.map((item) => ({
      id: Number(item.id),
      title: item.title ?? item.name ?? `#${item.id}`,
    }));
  });

  const getProjectId = () => {
    return props.projectFloor?.project_id ?? props.projectId ?? 0;
  };

  const getProjectPreviewId = () => {
    return props.projectFloor?.project_preview_id ?? props.projectPreviewId ?? 0;
  };

  const getDefaultFloorNumber = () => {
    return floorNumberOptions.value.find((item) => item.id === FloorNumber.GROUND_FLOOR) ?? null;
  };

  const mapSpacesToParams = (): ProjectFloorSpaceParams[] => {
    return spaces.value.map((item) => ({
      space_id: Number(item.space.id),
      length: Number(item.length || 0),
      width: Number(item.width || 0),
      height: Number(item.height || 0),
      notes: item.notes,
      attachments: item.attachments,
    }));
  };

  const updateData = () => {
    emit(
      'updateData',
      new AddProjectFloorParams({
        project_id: getProjectId(),
        project_preview_id: getProjectPreviewId(),
        floor_number: selectedFloorNumber.value?.id as FloorNumber,
        site_description: siteDescription.value,
        technical_general_notes: technicalGeneralNotes.value,
        inspection_recommendations: inspectionRecommendations.value,
        spaces: mapSpacesToParams(),
      }),
    );
  };

  const updateFloorNumber = (value: TitleInterface<FloorNumber> | null) => {
    selectedFloorNumber.value = value;
    updateData();
  };

  const updateSelectedSpace = (value: TitleInterface<number>[] | TitleInterface<number> | null) => {
    if (!value) {
      selectedSpace.value = [];
      return;
    }

    selectedSpace.value = Array.isArray(value) ? value : [value];
  };

  const addSpace = () => {
    if (!selectedFloorNumber.value) return;
    if (!selectedSpace.value.length) return;

    selectedSpace.value.forEach((space) => {
      const alreadyExists = spaces.value.some((item) => {
        return Number(item.space.id) === Number(space.id);
      });

      if (alreadyExists) return;

      spaces.value.push({
        space: { ...space },
        length: '',
        width: '',
        height: '',
        notes: '',
        attachments: [],
      });
    });

    selectedSpace.value = [];
    updateData();
  };

  const removeSpace = (index: number) => {
    spaces.value.splice(index, 1);
    updateData();
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const updateSpaceAttachments = async (event: Event, index: number) => {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    const attachments = await Promise.all(
      files.map(async (file) => ({
        file: await fileToBase64(file),
        alt: file.name,
        link: null,
      })),
    );

    if (spaces.value[index]) {
      spaces.value[index].attachments = attachments;
    }

    updateData();
  };

  const resetForm = () => {
    selectedFloorNumber.value = getDefaultFloorNumber();
    selectedSpace.value = [];
    spaces.value = [];

    updateData();
  };

  defineExpose({
    resetForm,
  });

  watch(
    () => props.projectFloor,
    (projectFloor) => {
      if (!projectFloor) {
        selectedFloorNumber.value = getDefaultFloorNumber();
        selectedSpace.value = [];
        siteDescription.value = '';
        technicalGeneralNotes.value = '';
        inspectionRecommendations.value = '';
        spaces.value = [];
        updateData();
        return;
      }

      selectedFloorNumber.value =
        floorNumberOptions.value.find(
          (item) => Number(item.id) === Number(projectFloor.floor_number),
        ) ?? getDefaultFloorNumber();

      siteDescription.value = projectFloor.site_description ?? '';
      technicalGeneralNotes.value = projectFloor.technical_general_notes ?? '';
      inspectionRecommendations.value = projectFloor.inspection_recommendations ?? '';

      spaces.value = Array.isArray(projectFloor.spaces)
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
        : [];

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

  onMounted(async () => {
    await spaceController.fetchList(spaceParams);
  });
</script>

<template>
  <ProjectPreviewIndex />

  <div class="project-floor-form-card" dir="rtl">
    <header class="form-header">
      <div class="form-header__content">
        <span class="form-header__eyebrow">
          {{ $t('ProjectFloor.form_title') }}
        </span>

        <h3>{{ $t('ProjectFloor.floor_data') }}</h3>

        <p>{{ $t('ProjectFloor.form_description') }}</p>
      </div>

      <div class="form-header__summary">
        <span>{{ $t('ProjectFloor.selected_spaces') }}</span>
        <strong>{{ spaces.length }}</strong>
      </div>
    </header>

    <div class="form-body" :class="{ disabled: loading }">
      <section class="section-card section-card--hero">
        <div class="section-head">
          <div class="section-head__icon">🏢</div>

          <div>
            <h4>{{ $t('ProjectFloor.floor_data') }}</h4>
            <p>{{ $t('ProjectFloor.floor_data_description') }}</p>
          </div>
        </div>

        <div class="picker-panel">
          <div class="picker-field picker-field--floor">
            <span class="field-help-label-row field-help-label-row--block">
              <label class="field-label" for="floor_number">
                {{ $t('ProjectFloor.floor_number') }}
              </label>
              <FieldHelpIcon
                :label="$t('ProjectFloor.floor_number')"
                field-name="floor_number"
                field-id="floor_number"
              />
            </span>

            <UpdatedCustomInputSelect
              id="floor_number"
              :model-value="selectedFloorNumber"
              :static-options="floorNumberOptions"
              :placeholder="$t('ProjectFloor.floor_number_placeholder')"
              @update:model-value="updateFloorNumber"
            />
          </div>

          <div class="picker-field picker-field--space">
            <span class="field-help-label-row field-help-label-row--block">
              <label class="field-label" for="space_id">
                {{ $t('ProjectFloor.space') }}
              </label>
              <FieldHelpIcon
                :label="$t('ProjectFloor.space')"
                field-name="space"
                field-id="space_id"
              />
            </span>

            <UpdatedCustomInputSelect
              id="space_id"
              :model-value="selectedSpace"
              :static-options="spaceOptions"
              :placeholder="$t('ProjectFloor.space_placeholder')"
              :type="2"
              @update:model-value="updateSelectedSpace"
            />
          </div>

          <div class="picker-field picker-field--action">
            <label class="field-label field-label--hidden">
              {{ $t('ProjectFloor.add_space') }}
            </label>

            <button
              type="button"
              class="add-space-btn"
              :disabled="!selectedFloorNumber || !selectedSpace.length"
              @click="addSpace"
            >
              <span>+</span>
              {{ $t('ProjectFloor.add_space') }}
            </button>
          </div>
        </div>
      </section>

      <section class="section-card spaces-section">
        <div class="section-head section-head--between">
          <div class="section-head__start">
            <div class="section-head__icon">📐</div>

            <div>
              <h4>{{ $t('ProjectFloor.selected_spaces') }}</h4>
              <p>{{ $t('ProjectFloor.selected_spaces_description') }}</p>
            </div>
          </div>

          <span class="spaces-count">
            {{ spaces.length }}
          </span>
        </div>

        <div v-if="!spaces.length" class="empty-spaces">
          <div class="empty-spaces__icon">＋</div>
          <h5>{{ $t('ProjectFloor.no_spaces_title') }}</h5>
          <p>{{ $t('ProjectFloor.no_spaces_description') }}</p>
        </div>

        <div v-else class="spaces-table">
          <div class="spaces-table__head">
            <span>#</span>
            <span>{{ $t('ProjectFloor.floor_number') }}</span>
            <span>{{ $t('ProjectFloor.space') }}</span>
            <span>{{ $t('ProjectFloor.length') }}</span>
            <span>{{ $t('ProjectFloor.width') }}</span>
            <span>{{ $t('ProjectFloor.height') }}</span>
            <span>{{ $t('ProjectFloor.attachments') }}</span>
            <span>{{ $t('ProjectFloor.notes') }}</span>
            <span></span>
          </div>

          <article
            v-for="(item, index) in spaces"
            :key="`${item.space.id}-${index}`"
            class="space-row"
          >
            <div class="space-row__index">
              {{ index + 1 }}
            </div>

            <div class="space-row__cell space-row__floor">
              <span class="mobile-label">{{ $t('ProjectFloor.floor_number') }}</span>
              <strong>{{ selectedFloorNumber?.title || '-' }}</strong>
            </div>

            <div class="space-row__cell space-row__name">
              <span class="mobile-label">{{ $t('ProjectFloor.space') }}</span>
              <strong>{{ item.space.title }}</strong>
            </div>

            <div class="space-row__cell">
              <span class="mobile-label">{{ $t('ProjectFloor.length') }}</span>
              <input
                v-model="item.length"
                class="mini-input"
                type="number"
                min="0"
                step="0.01"
                :placeholder="$t('ProjectFloor.length_placeholder')"
                @input="updateData"
              />
            </div>

            <div class="space-row__cell">
              <span class="mobile-label">{{ $t('ProjectFloor.width') }}</span>
              <input
                v-model="item.width"
                class="mini-input"
                type="number"
                min="0"
                step="0.01"
                :placeholder="$t('ProjectFloor.width_placeholder')"
                @input="updateData"
              />
            </div>

            <div class="space-row__cell">
              <span class="mobile-label">{{ $t('ProjectFloor.height') }}</span>
              <input
                v-model="item.height"
                class="mini-input"
                type="number"
                min="0"
                step="0.01"
                :placeholder="$t('ProjectFloor.height_placeholder')"
                @input="updateData"
              />
            </div>

            <div class="space-row__cell">
              <span class="mobile-label">{{ $t('ProjectFloor.attachments') }}</span>

              <label class="upload-chip">
                <input type="file" multiple @change="updateSpaceAttachments($event, index)" />

                <span class="upload-chip__icon">⬆</span>

                <span>
                  {{
                    item.attachments.length
                      ? $t('ProjectFloor.files_count', { count: item.attachments.length })
                      : $t('ProjectFloor.choose_files')
                  }}
                </span>
              </label>
            </div>

            <div class="space-row__cell">
              <span class="mobile-label">{{ $t('ProjectFloor.notes') }}</span>
              <input
                v-model="item.notes"
                class="mini-input mini-input--notes"
                type="text"
                :placeholder="$t('ProjectFloor.notes_placeholder')"
                @input="updateData"
              />
            </div>

            <div class="space-row__actions">
              <button type="button" class="remove-space-btn" @click="removeSpace(index)">✕</button>
            </div>
          </article>
        </div>
      </section>

      <section class="section-card notes-section">
        <div class="section-head">
          <div class="section-head__icon">📝</div>

          <div>
            <h4>{{ $t('ProjectFloor.site_recommendations') }}</h4>
            <p>{{ $t('ProjectFloor.site_recommendations_description') }}</p>
          </div>
        </div>

        <div class="notes-list">
          <div class="note-field">
            <div class="note-field__label">
              <span>01</span>
              <span class="field-help-label-row">
                <label for="site_description">
                  {{ $t('ProjectFloor.site_description') }}
                </label>
                <FieldHelpIcon
                  :label="$t('ProjectFloor.site_description')"
                  field-name="description"
                  field-id="site_description"
                />
              </span>
            </div>

            <textarea
              id="site_description"
              v-model="siteDescription"
              class="field-input field-textarea"
              :placeholder="$t('ProjectFloor.site_description_placeholder')"
              @input="updateData"
            />
          </div>

          <div class="note-field">
            <div class="note-field__label">
              <span>02</span>
              <span class="field-help-label-row">
                <label for="technical_general_notes">
                  {{ $t('ProjectFloor.technical_general_notes') }}
                </label>
                <FieldHelpIcon
                  :label="$t('ProjectFloor.technical_general_notes')"
                  field-name="notes"
                  field-id="technical_general_notes"
                />
              </span>
            </div>

            <textarea
              id="technical_general_notes"
              v-model="technicalGeneralNotes"
              class="field-input field-textarea"
              :placeholder="$t('ProjectFloor.technical_general_notes_placeholder')"
              @input="updateData"
            />
          </div>

          <div class="note-field">
            <div class="note-field__label">
              <span>03</span>
              <span class="field-help-label-row">
                <label for="inspection_recommendations">
                  {{ $t('ProjectFloor.inspection_recommendations') }}
                </label>
                <FieldHelpIcon
                  :label="$t('ProjectFloor.inspection_recommendations')"
                  field-name="notes"
                  field-id="inspection_recommendations"
                />
              </span>
            </div>

            <textarea
              id="inspection_recommendations"
              v-model="inspectionRecommendations"
              class="field-input field-textarea"
              :placeholder="$t('ProjectFloor.inspection_recommendations_placeholder')"
              @input="updateData"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
<style scoped lang="scss">
  .project-floor-form-card {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.25rem;
    border-radius: 28px;
    background:
      radial-gradient(circle at top right, rgba(160, 98, 39, 0.08), transparent 34%),
      linear-gradient(180deg, #fff, #fafafa);
  }

  .form-header {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.25rem;
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 26px;
    background: rgba(255, 255, 255, 0.86);
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .form-header__content {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;

    h3 {
      margin: 0;
      font-family: 'Bold';
      color: #111827;
      font-size: 1.2rem;
    }

    p {
      max-width: 760px;
      margin: 0;
      color: #64748b;
      font-size: var(--sm-size);
      line-height: 1.8;
    }
  }

  .form-header__eyebrow {
    width: fit-content;
    padding: 0.28rem 0.65rem;
    border-radius: 999px;
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
    font-family: 'Medium';
    font-size: var(--xs-size);
  }

  .form-header__summary {
    display: flex;
    min-width: 120px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    padding: 0.8rem 1rem;
    border-radius: 22px;
    background: #111827;
    color: #fff;

    span {
      color: rgba(255, 255, 255, 0.72);
      font-size: var(--xs-size);
      white-space: nowrap;
    }

    strong {
      font-family: 'Bold';
      font-size: 1.55rem;
      line-height: 1;
    }
  }

  .form-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    &.disabled {
      pointer-events: none;
      opacity: 0.7;
    }
  }

  .section-card {
    padding: 1.15rem;
    border: 1px solid rgba(148, 163, 184, 0.22);
    border-radius: 26px;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 14px 35px rgba(15, 23, 42, 0.045);
  }

  .section-card--hero {
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(250, 250, 250, 0.98)),
      radial-gradient(circle at top left, rgba(160, 98, 39, 0.08), transparent 34%);
  }

  .section-head {
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;
    margin-bottom: 1rem;

    h4 {
      margin: 0;
      font-family: 'Bold';
      color: #111827;
      font-size: 1rem;
    }

    p {
      margin: 0.25rem 0 0;
      color: #64748b;
      font-size: var(--xs-size);
      line-height: 1.7;
    }
  }

  .section-head--between {
    align-items: center;
    justify-content: space-between;
  }

  .section-head__start {
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;
  }

  .section-head__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    min-width: 42px;
    height: 42px;
    border: 1px solid rgba(160, 98, 39, 0.14);
    border-radius: 16px;
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
  }

  .picker-panel {
    display: grid;
    grid-template-columns: repeat(3, 3fr);
    gap: 0.85rem;
    align-items: end;
    padding: 1rem;
    border: 1px solid rgba(148, 163, 184, 0.16);
    border-radius: 22px;
    background: #fbfbfb;
  }

  .picker-field {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 0.55rem;
  }

  .picker-field--action {
    justify-content: flex-end;
  }

  .field-label {
    font-family: 'Medium';
    font-size: var(--sm-size);
    color: #334155;
  }

  .field-label--hidden {
    visibility: hidden;
  }

  .form-section :deep(.input-label) {
    display: none;
  }

  .add-space-btn {
    display: inline-flex;
    width: 100%;
    min-height: 46px;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    padding: 0 1.15rem;
    border: 0;
    border-radius: 16px;
    background: linear-gradient(135deg, var(--PrimaryColor), #7a4318);
    color: #fff;
    cursor: pointer;
    font-family: 'Medium';
    transition: all 0.25s ease;
    white-space: nowrap;
    box-shadow: 0 12px 22px rgba(122, 67, 24, 0.18);

    span {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.18);
    }

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 16px 28px rgba(122, 67, 24, 0.22);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
      box-shadow: none;
    }
  }

  .spaces-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: 40px;
    padding: 0 0.8rem;
    border-radius: 999px;
    background: #111827;
    color: #fff;
    font-family: 'Bold';
  }

  .empty-spaces {
    display: flex;
    min-height: 160px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    border: 1px dashed rgba(148, 163, 184, 0.5);
    border-radius: 22px;
    background: #fbfbfb;
    text-align: center;

    h5 {
      margin: 0;
      color: #111827;
      font-family: 'Bold';
    }

    p {
      max-width: 420px;
      margin: 0;
      color: #64748b;
      font-size: var(--xs-size);
      line-height: 1.7;
    }
  }

  .empty-spaces__icon {
    display: inline-flex;
    width: 46px;
    height: 46px;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
    font-family: 'Bold';
    font-size: 1.2rem;
  }

  .spaces-table {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  .spaces-table__head,
  .space-row {
    display: grid;
    grid-template-columns: 44px 1fr 1.2fr 0.8fr 0.8fr 0.8fr 1.2fr 1.4fr 44px;
    gap: 0.65rem;
    align-items: center;
  }

  .spaces-table__head {
    padding: 0 0.75rem;
    color: #64748b;
    font-family: 'Medium';
    font-size: var(--xs-size);
  }

  .space-row {
    padding: 0.75rem;
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 20px;
    background: linear-gradient(135deg, #fff, #fbfbfb);
    transition: all 0.25s ease;

    &:hover {
      border-color: rgba(160, 98, 39, 0.28);
      box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
      transform: translateY(-1px);
    }
  }

  .space-row__index {
    display: inline-flex;
    width: 34px;
    height: 34px;
    align-items: center;
    justify-content: center;
    border-radius: 13px;
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
    font-family: 'Bold';
  }

  .space-row__cell {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 0.3rem;

    strong {
      color: #111827;
      font-family: 'Medium';
      font-size: var(--sm-size);
    }
  }

  .space-row__floor strong {
    width: fit-content;
    padding: 0.35rem 0.6rem;
    border-radius: 999px;
    background: #f8fafc;
    color: #334155;
  }

  .space-row__name strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mini-input,
  .field-input {
    width: 100%;
    min-height: 44px;
    padding: 0.7rem 0.85rem;
    border: 1px solid rgba(148, 163, 184, 0.26);
    border-radius: 15px;
    background: #fff;
    outline: none;
    transition: all 0.25s ease;
    font-family: 'Medium';
    font-size: var(--sm-size);
    color: #111827;

    &:focus {
      border-color: var(--PrimaryColor);
      box-shadow: 0 0 0 3px var(--PrimaryColor-light);
    }
  }

  .mini-input--notes {
    min-width: 150px;
  }

  .upload-chip {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    padding: 0 0.75rem;
    border: 1px dashed rgba(148, 163, 184, 0.55);
    border-radius: 15px;
    background: #fff;
    color: #475569;
    cursor: pointer;
    font-family: 'Medium';
    font-size: var(--xs-size);
    transition: all 0.25s ease;

    input {
      display: none;
    }

    &:hover {
      border-color: var(--PrimaryColor);
      background: var(--PrimaryColor-light);
      color: var(--PrimaryColor);
    }
  }

  .upload-chip__icon {
    display: inline-flex;
    width: 22px;
    height: 22px;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: #f8fafc;
  }

  .space-row__actions {
    display: flex;
    justify-content: flex-end;
  }

  .remove-space-btn {
    display: inline-flex;
    width: 34px;
    height: 34px;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 13px;
    background: rgba(220, 38, 38, 0.08);
    color: #dc2626;
    cursor: pointer;
    transition: all 0.25s ease;

    &:hover {
      background: #dc2626;
      color: #fff;
    }
  }

  .notes-list {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .note-field {
    display: grid;
    // grid-template-columns: 240px minmax(0, 1fr);
    gap: 1rem;
    align-items: start;
    padding: 0.85rem;
    border: 1px solid rgba(148, 163, 184, 0.16);
    border-radius: 20px;
    background: #fbfbfb;
  }

  .note-field__label {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding-top: 0.35rem;

    span {
      display: inline-flex;
      // width: 34px;
      height: 34px;
      align-items: center;
      justify-content: center;
      border-radius: 13px;
      // background: var(--PrimaryColor-light);
      color: var(--PrimaryColor);
      font-family: 'Bold';
      font-size: var(--xs-size);
    }

    label {
      color: #334155;
      font-family: 'Medium';
      font-size: var(--sm-size);
      line-height: 1.6;
    }
  }

  .field-textarea {
    min-height: 100px;
    resize: vertical;
    line-height: 1.8;
  }

  .mobile-label {
    display: none;
  }

  @media (max-width: 1200px) {
    .spaces-table__head {
      display: none;
    }

    .space-row {
      grid-template-columns: 42px repeat(2, minmax(0, 1fr)) 42px;
      align-items: stretch;
    }

    .space-row__cell {
      padding: 0.25rem 0;
    }

    .space-row__index {
      align-self: flex-start;
    }

    .space-row__actions {
      align-self: flex-start;
    }

    .mobile-label {
      display: block;
      color: #94a3b8;
      font-size: 0.72rem;
      font-family: 'Medium';
    }
  }

  @media (max-width: 992px) {
    .picker-panel {
      grid-template-columns: 1fr 1fr;
    }

    .picker-field--action {
      grid-column: span 2;
    }
  }

  @media (max-width: 768px) {
    .project-floor-form-card {
      padding: 0.75rem;
      border-radius: 20px;
    }

    .form-header {
      flex-direction: column;
    }

    .form-header__summary {
      width: 100%;
      flex-direction: row;
      justify-content: space-between;
    }

    .picker-panel,
    .note-field {
      grid-template-columns: 1fr;
    }

    .picker-field--action {
      grid-column: span 1;
    }

    .field-label--hidden {
      display: none;
    }

    .space-row {
      grid-template-columns: 1fr;
    }

    .space-row__actions {
      justify-content: flex-start;
    }

    .section-card {
      padding: 0.9rem;
      border-radius: 20px;
    }
  }
</style>
