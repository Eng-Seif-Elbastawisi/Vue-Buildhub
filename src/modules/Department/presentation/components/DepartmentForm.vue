<script setup lang="ts">
  import { ref, watch } from 'vue';
  import AddDepartmentParams from '../../core/params/add.department.params';
  import EditDepartmentParams from '../../core/params/edit.department.params';
  import type DepartmentModel from '../../core/models/department.model';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import IndexStageParams from '@/modules/Stages/core/params/index.stage.params';
  import StageController from '@/modules/Stages/presentation/controllers/stage.controller';
  import TitleInterface from '@/base/Data/Models/titleInterface';

  const emit = defineEmits<{
    updateData: [params: AddDepartmentParams | EditDepartmentParams];
  }>();
  const SelectedStage = ref<TitleInterface<number>>();

  const { department, loading } = defineProps<{
    department?: DepartmentModel;
    loading?: boolean;
  }>();

  const title = ref<string>('');

  const updateData = () => {
    if (department?.id) {
      emit(
        'updateData',
        new EditDepartmentParams({
          id: department.id,
          title: title.value,
          stageId: Number(SelectedStage.value?.id),
        }),
      );
      return;
    }

    emit(
      'updateData',
      new AddDepartmentParams({
        title: title.value,
        stageId: Number(SelectedStage.value?.id),
      }),
    );
  };

  watch(
    () => department,
    (newStage) => {
      title.value = newStage?.title ?? '';
      SelectedStage.value = new TitleInterface({
        id: Number(newStage?.stage.id),
        title: newStage?.stage.title,
      });
      updateData();
    },
    { immediate: true },
  );
  const stageparams = new IndexStageParams();
  const stagecontroller = StageController.getInstance();
  const updateStage = (data: TitleInterface<number>) => {
    SelectedStage.value = data;
    updateData();
  };
</script>

<template>
  <div class="form-fields">
    <div class="field-group" :class="{ disabled: loading }">
      <label class="field-label" for="title"> {{ $t('stage_title') }} </label>
      <div class="input-wrap">
        <input
          id="title"
          v-model="title"
          type="text"
          :placeholder="$t('stage_title')"
          class="field-input"
          @input="updateData"
        />
      </div>
    </div>
    <div class="field-group" :class="{ disabled: loading }">
      <UpdatedCustomInputSelect
        id="doc-branch"
        :label="`subject name`"
        :params="stageparams"
        :controller="stagecontroller"
        v-model="SelectedStage"
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
