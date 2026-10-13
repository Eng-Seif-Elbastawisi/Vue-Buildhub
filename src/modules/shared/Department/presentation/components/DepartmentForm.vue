<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';

  import TitleInterface from '@/base/Data/Models/titleInterface';
  import TranslationParams from '@/base/Core/Params/translationParams';

  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';

  import IndexStageParams from '@/modules/shared/Stages/core/params/index.stage.params';
  import StageController from '@/modules/shared/Stages/presentation/controllers/stage.controller';

  import AddDepartmentParams from '../../core/params/add.department.params';
  import EditDepartmentParams from '../../core/params/edit.department.params';
  import DepartmentModel from '../../core/models/department.model';
  import { DepartmentTypeEnum } from '../../core/constants/Type.enum';

  const emit = defineEmits<{
    updateData: [params: AddDepartmentParams | EditDepartmentParams];
  }>();

  const props = defineProps<{
    department?: DepartmentModel;
    loading?: boolean;
    resetKey?: number;
    type?: DepartmentTypeEnum;
  }>();

  const title = ref<Record<string, string>>({});

  const selectedStage = ref<TitleInterface<number>>();

  const stageParams = new IndexStageParams({
    parentId: null,
    status: true,
  });

  const stageController = StageController.getInstance();

  const getFormType = (): DepartmentTypeEnum | undefined => props.type ?? props.department?.type;
  const requiresStage = computed(() => getFormType() !== DepartmentTypeEnum.DESIGN);

  const updateData = () => {
    const translations = new TranslationParams({
      title: {
        ...title.value,
      },
    });

    const stageId = selectedStage.value?.id ? Number(selectedStage.value.id) : undefined;

    const type = getFormType();

    if (props.department?.id) {
      emit(
        'updateData',
        new EditDepartmentParams({
          id: props.department.id,
          translations,
          stageId,
          type: type as DepartmentTypeEnum,
        }),
      );

      return;
    }

    emit(
      'updateData',
      new AddDepartmentParams({
        translations,
        stageId,
        type: type as DepartmentTypeEnum,
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

    updateData();
  };

  const resetForm = () => {
    title.value = {};
    selectedStage.value = undefined;

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
      updateData();
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

  watch(
    () => props.type,
    () => {
      updateData();
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
    <div class="field-group" :class="{ disabled: loading }">
      <MultiLangInput
        field-key="title"
        :label="$t('title')"
        :languages="['en', 'ar']"
        :model-value="title"
        type="title"
        @update:model-value="updateTitle"
      />
    </div>

    <div v-if="requiresStage" class="field-group field-group--stage" :class="{ disabled: loading }">
      <UpdatedCustomInputSelect
        id="doc-branch"
        v-model="selectedStage"
        :label="$t('stage')"
        :params="stageParams"
        :controller="stageController"
        :placeholder="$t('select_stage')"
        :reload="true"
        @update:model-value="updateStage"
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

  // .col-span-2 {
  //   grid-column: span 2;
  // }

  .field-group {
    min-width: 0;

    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.7;
    }
  }

  // .field-group--stage {
  //   grid-column: 1 / -1;
  //   justify-self: start;
  //   width: min(100%, 720px);
  // }

  @media (max-width: 768px) {
    .form-fields {
      grid-template-columns: 1fr;
    }

    .col-span-2 {
      grid-column: span 1;
    }
  }
</style>
