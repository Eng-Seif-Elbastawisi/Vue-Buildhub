<script setup lang="ts">
  import { ref, watch } from 'vue';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import TranslationParams from '@/base/Core/Params/translationParams';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import IndexStageParams from '@/modules/Stages/core/params/index.stage.params';
  import StageController from '@/modules/Stages/presentation/controllers/stage.controller';
  import AddDepartmentParams from '../../core/params/add.department.params';
  import EditDepartmentParams from '../../core/params/edit.department.params';
  import type DepartmentModel from '../../core/models/department.model';

  const emit = defineEmits<{
    updateData: [params: AddDepartmentParams | EditDepartmentParams];
  }>();

  const props = defineProps<{
    department?: DepartmentModel;
    loading?: boolean;
  }>();

  const title = ref<Record<string, string>>({});
  const selectedStage = ref<TitleInterface<number>>();
  const stageParams = new IndexStageParams();
  const stageController = StageController.getInstance();

  const updateData = () => {
    const translations = new TranslationParams({ title: title.value });
    const stageId = Number(selectedStage.value?.id);

    if (props.department?.id) {
      emit(
        'updateData',
        new EditDepartmentParams({
          id: props.department.id,
          translations,
          stageId,
        }),
      );
      return;
    }

    emit(
      'updateData',
      new AddDepartmentParams({
        translations,
        stageId,
      }),
    );
  };

  const updateTitle = (value: Record<string, string>) => {
    title.value = value;
    updateData();
  };

  const updateStage = (data: TitleInterface<number>) => {
    selectedStage.value = data;
    updateData();
  };

  watch(
    () => props.department,
    (department) => {
      if (!department) return;

      title.value = { ...department.translations.title };
      selectedStage.value = new TitleInterface({
        id: Number(department.stage.id),
        title: department.stage.title,
      });
      updateData();
    },
    { immediate: true },
  );
</script>

<template>
  <div class="form-fields">
    <div class="field-group col-span-2" :class="{ disabled: props.loading }">
      <MultiLangInput
        field-key="title"
        :label="$t('title')"
        :languages="['en', 'ar']"
        :model-value="title"
        type="title"
        @update:model-value="updateTitle"
      />
    </div>

    <div class="field-group" :class="{ disabled: props.loading }">
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
  </div>
</template>

<style scoped lang="scss">
  .form-fields {
    padding: 20px;

    .field-group {
      &.disabled {
        cursor: not-allowed;
        pointer-events: none;
        opacity: 0.7;
      }
    }
  }
</style>
