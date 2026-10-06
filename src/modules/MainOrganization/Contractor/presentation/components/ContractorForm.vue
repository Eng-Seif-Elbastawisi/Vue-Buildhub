<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import CustomSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import StageController from '@/modules/shared/Stages/presentation/controllers/stage.controller';
  import IndexStageParams from '@/modules/shared/Stages/core/params/index.stage.params';
  import type ContractorModel from '../../core/models/contractor.model';
  import AddContractorParams from '../../core/params/add.contractor.params';

  const props = defineProps<{ contractor?: ContractorModel; loading?: boolean }>();
  const emit = defineEmits<{ updateData: [params: AddContractorParams] }>();
  const name = ref('');
  const selectedStages = ref<TitleInterface<number>[]>([]);
  const stageController = StageController.getInstance();
  const mainStageParams = new IndexStageParams({ perPage: 100, withPage: 0, parentId: null });

  const updateData = () => {
    emit(
      'updateData',
      new AddContractorParams(
        name.value,
        selectedStages.value.map((stage) => Number(stage.id)),
      ),
    );
  };

  watch(
    () => props.contractor,
    (contractor) => {
      if (!contractor) return;
      name.value = contractor.name;
      selectedStages.value = contractor.stageIds.map(
        (id) =>
          new TitleInterface({
            id,
            title: contractor.stages.find((stage) => stage.id === id)?.title ?? String(id),
          }),
      );
      updateData();
    },
    { immediate: true },
  );
  onMounted(updateData);
</script>

<template>
  <div class="contractor-form-card">
    <header>
      <h3>{{ $t('Contractor.form_title') }}</h3>
      <p>{{ $t('Contractor.form_description') }}</p>
    </header>
    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group">
        <label class="field-label" for="contractor-name">{{ $t('Contractor.name') }}</label>
        <input
          id="contractor-name"
          v-model="name"
          class="field-input"
          type="text"
          :placeholder="$t('Contractor.name_placeholder')"
          :disabled="loading"
          required
          @input="updateData"
        />
      </div>
      <div class="field-group">
        <CustomSelect
          id="contractor-main-stages"
          v-model="selectedStages"
          :controller="stageController"
          :params="mainStageParams"
          :label="$t('Contractor.main_stages')"
          :placeholder="$t('Contractor.stages_placeholder')"
          :type="2"
          :disabled="loading"
          required
          @update:model-value="updateData"
        />
      </div>
    </div>
  </div>
</template>
