<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { ref } from 'vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import StandardFormSectionHeader from '@/shared/components/form/StandardFormSectionHeader.vue';
  import TermController from '../controllers/term.controller';
  import type AddTermParams from '../../core/params/add.term.params';
  import type TermModel from '../../core/models/term.model';
  import EditTermParams from '../../core/params/edit.term.params';
  import TermForm from './TermForm.vue';

  const controller = TermController.getInstance();
  const params = ref<AddTermParams | null>(null);
  const loading = ref(false);
  const { term } = defineProps<{ term?: TermModel }>();
  const emit = defineEmits(['saved']);

  const saveDepartment = async () => {
    loading.value = true;
    try {
      if (!params.value) {
        console.error('No department parameters to save');
        return;
      }

      const paramsToSave = params.value;

      const result =
        paramsToSave instanceof EditTermParams
          ? await controller.update(paramsToSave, undefined)
          : await controller.create(paramsToSave, undefined);

      if (result) {
        emit('saved');
      }
    } catch (error) {
      console.error('Error saving email:', error);
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <StandardFormLayout as="section" mode="create" class="department-page">
    <StandardFormSectionHeader
      :title="$t('Term.form_title')"
      :description="$t('Term.form_description')"
      icon="pi pi-file-edit"
    />
    <TermForm
      :loading="loading"
      :term="term"
      @update-data="(value) => (params = value as AddTermParams)"
    />

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>

    <template #actions>
      <div class="actions">
        <AppButton :loading="loading" :title="$t('save')" type="button" @click="saveDepartment">{{
          $t('save')
        }}</AppButton>
      </div>
    </template>
  </StandardFormLayout>
</template>
<style scoped>
.actions {
  padding: 0 0 20px 20px;
}

.error {
  margin-top: 20px;
  padding: 10px;
  background-color: var(--danger-light);
  color: var(--danger-dark);
  border: 1px solid var(--bh-coral-soft);
  border-radius: 4px;
}
</style>
