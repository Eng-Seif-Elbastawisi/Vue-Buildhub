<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  import TitleInterface from '@/base/Data/Models/titleInterface';
  import TranslationParams from '@/base/Core/Params/translationParams';

  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';

  import IndexStageParams from '@/modules/shared/Stages/core/params/index.stage.params';
  import StageController from '@/modules/shared/Stages/presentation/controllers/stage.controller';

  import AddDepartmentParams from '../../core/params/add.department.params';
  import EditDepartmentParams from '../../core/params/edit.department.params';
  import DepartmentModel from '../../core/models/department.model';
  import { Type } from '../../core/constants/Type.enum';

  const emit = defineEmits<{
    updateData: [params: AddDepartmentParams | EditDepartmentParams];
  }>();

  const props = defineProps<{
    department?: DepartmentModel;
    loading?: boolean;
    resetKey?: number;
  }>();

  const { t } = useI18n();

  const title = ref<Record<string, string>>({});

  const selectedStage = ref<TitleInterface<number>>();

  const selectedType = ref<TitleInterface<number>>();

  const stageParams = new IndexStageParams();

  const stageController = StageController.getInstance();

  const typeOptions = computed<TitleInterface<number>[]>(() => [
    new TitleInterface({
      id: Type.DESIGN,
      title: t('types.design'),
    }),

    new TitleInterface({
      id: Type.SUPERVISION,
      title: t('types.supervision'),
    }),

    new TitleInterface({
      id: Type.BOTH,
      title: t('types.both'),
    }),
  ]);

  const getTypeOption = (typeId?: number): TitleInterface<number> | undefined => {
    if (typeId === undefined || typeId === null) {
      return undefined;
    }

    return typeOptions.value.find((option) => Number(option.id) === Number(typeId));
  };

  const updateData = () => {
    const translations = new TranslationParams({
      title: {
        ...title.value,
      },
    });

    const stageId = selectedStage.value?.id ? Number(selectedStage.value.id) : undefined;

    const type = selectedType.value?.id ? Number(selectedType.value.id) : undefined;

    if (props.department?.id) {
      emit(
        'updateData',
        new EditDepartmentParams({
          id: props.department.id,
          translations,
          stageId: stageId ?? 0,
          type: type ?? 0,
        }),
      );

      return;
    }

    emit(
      'updateData',
      new AddDepartmentParams({
        translations,
        stageId: stageId ?? 0,
        type: type ?? 0,
      }),
    );
  };

  const updateTitle = (value: Record<string, string>) => {
    title.value = {
      ...value,
    };

    updateData();
  };

  const updateStage = (value?: TitleInterface<number>) => {
    selectedStage.value = value;

    updateData();
  };

  const updateType = (value?: TitleInterface<number>) => {
    selectedType.value = value;

    updateData();
  };

  const fillDepartmentData = (department: DepartmentModel) => {
    title.value = {
      ...DepartmentModel.mapTranslations(department.translations?.title),
    };

    if (department.stage?.id) {
      selectedStage.value = new TitleInterface<number>({
        id: Number(department.stage.id),

        title: DepartmentModel.toBilingualLabel(
          DepartmentModel.mapTranslations(department.stage.title),
          department.stage.title,
        ),
      });
    } else {
      selectedStage.value = undefined;
    }

    selectedType.value = getTypeOption(
      department.type !== undefined ? Number(department.type) : undefined,
    );

    updateData();
  };

  const resetForm = () => {
    title.value = {};
    selectedStage.value = undefined;
    selectedType.value = undefined;

    updateData();
  };

  watch(
    () => props.department,
    (department) => {
      if (!department) {
        resetForm();
        return;
      }

      fillDepartmentData(department);
    },
    {
      immediate: true,
    },
  );

  watch(
    () => props.resetKey,
    (newValue, oldValue) => {
      if (newValue === oldValue) {
        return;
      }

      resetForm();
    },
  );

  onMounted(() => {
    if (!props.department) {
      updateData();
    }
  });
</script>

<template>
  <div class="form-fields">
    <div class="field-group col-span-2" :class="{ disabled: loading }">
      <MultiLangInput
        field-key="title"
        :label="$t('title')"
        :languages="['en', 'ar']"
        :model-value="title"
        type="title"
        @update:model-value="updateTitle"
      />
    </div>

    <div class="field-group" :class="{ disabled: loading }">
      <UpdatedCustomInputSelect
        id="doc-branch"
        v-model="selectedStage"
        :label="$t('subject name')"
        :params="stageParams"
        :controller="stageController"
        :placeholder="$t('Enter subject name')"
        :reload="true"
        @update:model-value="updateStage"
      />
    </div>

    <div class="field-group" :class="{ disabled: loading }">
      <UpdatedCustomInputSelect
        id="type"
        v-model="selectedType"
        :label="$t('types')"
        :static-options="typeOptions"
        :placeholder="$t('Enter types')"
        @update:model-value="updateType"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
  .form-fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    padding: 20px;
  }

  .col-span-2 {
    grid-column: span 2;
  }

  .field-group {
    min-width: 0;

    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.7;
    }
  }

  @media (max-width: 768px) {
    .form-fields {
      grid-template-columns: 1fr;
    }

    .col-span-2 {
      grid-column: span 1;
    }
  }
</style>
