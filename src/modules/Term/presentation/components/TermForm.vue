<script setup lang="ts">
  import { ref, watch } from 'vue';
  import AddTermParams from '../../core/params/add.term.params';
  import EditTermParams from '../../core/params/edit.term.params';
  import type TermModel from '../../core/models/term.model';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import IndexStageParams from '@/modules/Stages/core/params/index.stage.params';
  import StageController from '@/modules/Stages/presentation/controllers/stage.controller';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import IndexDepartmentParams from '@/modules/Department/core/params/index.department.params';
  import DepartmentController from '@/modules/Department/presentation/controllers/department.controller';

  const emit = defineEmits<{
    updateData: [params: AddTermParams | EditTermParams];
  }>();
  const SelectedStage = ref<TitleInterface<number>>();

  const { term, loading } = defineProps<{
    term?: TermModel;
    loading?: boolean;
  }>();

  const title = ref<string>('');

  const updateData = () => {
    if (term?.id) {
      emit(
        'updateData',
        new EditTermParams({
          id: term.id,
          title: title.value,
          departmentId: Number(SelectedStage.value?.id),
        }),
      );
      return;
    }

    emit(
      'updateData',
      new AddTermParams({
        title: title.value,
        departmentId: Number(SelectedStage.value?.id),
      }),
    );
  };

  watch(
    () => term,
    (newStage) => {
      title.value = newStage?.title ?? '';
      SelectedStage.value = new TitleInterface({
        id: Number(newStage?.department.id),
        title: newStage?.department.title,
      });
      updateData();
    },
    { immediate: true },
  );
  const indexDepartmentParams = new IndexDepartmentParams('');
  const indexDepartmentController = DepartmentController.getInstance();
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
        :label="`department name`"
        :params="indexDepartmentParams"
        :controller="indexDepartmentController"
        v-model="SelectedStage"
        :placeholder="$t('Enter department name')"
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
