<script setup lang="ts">
  import { ref, watch } from 'vue';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import AddMeasurementParams from '../../core/params/add.measurement.params';
  import EditMeasurementParams from '../../core/params/edit.measurement.params';
  import type measurementModel from '../../core/models/measurement.model';

  const emit = defineEmits<{
    updateData: [params: AddMeasurementParams | EditMeasurementParams];
  }>();

  const { stage, loading } = defineProps<{
    stage?: measurementModel;
    loading?: boolean;
  }>();
  const translations = ref<{ [key: string]: string }>({});
  const updateData = () => {
    if (stage?.id) {
      emit(
        'updateData',
        new EditMeasurementParams({ id: stage?.id, translations: { title: translations.value } }),
      );
      return;
    }

    emit(
      'updateData',
      new AddMeasurementParams({
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
    <!-- <div class="field-group" :class="{ disabled: loading }">
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
    </div> -->
    <div class="field-group" :class="{ disabled: loading }">
      <MultiLangInput
        v-model="translations"
        field-key="title"
        :label="$t('measurement_title')"
        :languages="['en', 'ar']"
        type="title"
        @update:model-value="updateData"
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
