<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { onMounted, ref, watch } from 'vue';
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import TranslationParams from '@/base/Core/Params/translationParams';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import IndexDepartmentParams from '@/modules/shared/Department/core/params/index.department.params';
  import DepartmentController from '@/modules/shared/Department/presentation/controllers/department.controller';
  import AddTermParams from '../../core/params/add.term.params';
  import EditTermParams from '../../core/params/edit.term.params';
  import type TermModel from '../../core/models/term.model';

  const emit = defineEmits<{
    updateData: [params: AddTermParams | EditTermParams];
  }>();

  const props = defineProps<{
    term?: TermModel;
    loading?: boolean;
  }>();

  const title = ref<Record<string, string>>({});
  const selectedDepartment = ref<TitleInterface<number>>();
  const indexDepartmentParams = new IndexDepartmentParams('');
  const indexDepartmentController = DepartmentController.getInstance();
  const translations = ref<Record<string, string>>({});

  const updateData = () => {
    const departmentId = Number(selectedDepartment.value?.id);

    if (props.term?.id) {
      emit(
        'updateData',
        new EditTermParams({
          id: props.term.id,
          translations: new TranslationParams({
            title: translations.value,
          }),
          departmentId,
        }),
      );
      return;
    }

    emit(
      'updateData',
      new AddTermParams({
        translations: new TranslationParams({
          title: translations.value,
        }),
        departmentId,
      }),
    );
  };

  const updateTranslations = (value: Record<string, string>) => {
    translations.value = value;
    updateData();
  };

  const updateDepartment = (data: TitleInterface<number>) => {
    selectedDepartment.value = data;
    updateData();
  };

  onMounted(updateData);

  watch(
    () => props.term,
    (term) => {
      if (!term) return;

      translations.value = { ...term.translations.title };
      selectedDepartment.value = {
        id: Number(term?.department?.id ?? undefined) as number,
        title: term?.department?.title,
      };
      updateData();
    },
    { immediate: true },
  );
</script>

<template>
  <StandardFormLayout class="form-fields">
    <div class="field-group col-span-2" :class="{ disabled: props.loading }">
      <MultiLangInput
        field-key="title"
        :label="$t('title')"
        :languages="['en', 'ar']"
        :model-value="translations"
        type="title"
        @update:model-value="updateTranslations"
      />
    </div>

    <div class="field-group" :class="{ disabled: props.loading }">
      <UpdatedCustomInputSelect
        id="doc-branch"
        v-model="selectedDepartment"
        :label="$t('department name')"
        :params="indexDepartmentParams"
        :controller="indexDepartmentController"
        :placeholder="$t('Enter department name')"
        :reload="true"
        @update:model-value="updateDepartment"
      />
    </div>
  </StandardFormLayout>
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
