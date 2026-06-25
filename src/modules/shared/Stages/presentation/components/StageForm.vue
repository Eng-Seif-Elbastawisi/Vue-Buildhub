<script setup lang="ts">
  import { ref, watch } from 'vue';
  import type StageModel from '../../core/models/stage.model';
  import AddStageParams from '../../core/params/add.stges.params';
  import EditStageParams from '../../core/params/edit.stage.params';
  import MultiLangInput from '@/shared/MultiLangInput.vue';

  const emit = defineEmits<{
    updateData: [params: AddStageParams | EditStageParams];
  }>();

  const { stage, loading } = defineProps<{
    stage?: StageModel;
    loading?: boolean;
  }>();
  const translations = ref<{ [key: string]: string }>({});
  const updateData = () => {
    if (stage?.id) {
      emit(
        'updateData',
        new EditStageParams({ id: stage?.id, translations: { title: translations.value } }),
      );
      return;
    }

    emit(
      'updateData',
      new AddStageParams({
        translations: { title: translations.value },
      }),
    );
  };

  watch(
    () => stage,
    (newStage) => {
      translations.value = newStage?.translations?.title ?? {};
      updateData();
    },
    { immediate: true },
  );
</script>

<template>
  <div class="form-fields">
    <div class="field-group" :class="{ disabled: loading }">
      <MultiLangInput
        v-model="translations"
        field-key="title"
        :label="$t('stage_title')"
        :languages="['en', 'ar']"
        type="title"
        @update:model-value="updateData"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
  .form-fields {
    padding: 0;
    display: block;
    width: 100%;
  }

  .field-group {
    width: 100%;

    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.7;
    }
  }
  // .field-input{
  //   width: 100%;
  //   padding: 12px 16px;
  //     padding-right: 16px;
  //   padding-right: 16px;
  //   padding-right: 50px;
  //   border: 1px solid var(--border-weak);
  //   border-radius: 28px;
  //   background: var(--white);
  //   outline: none;
  //   transition: all 0.25s ease;
  //   font-family: "Medium";
  //   font-weight: 400;
  //   font-size: var(--sm-size);
  //   color: var(--bread-crumb-color-span);
  //   max-height: 200px;
  //   max-width: 100%;
  // }
  // .email-crud-example .:hover{
  //   background-color: transparent !important;
  // }
</style>
