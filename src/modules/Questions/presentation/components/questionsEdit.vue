<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  // import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  // import IconAccept from '@/shared/icons/IconAccept.vue';
  import type EditQuestionParams from '../../core/params/edit.question.params';
  import ShowQuestionParams from '../../core/params/show.question.params';
  import questionsController from '../controllers/questions.controller';
  import QuestionsForm from './questionsForm.vue';

  const controller = questionsController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;

  const params = ref<EditQuestionParams | null>(null);

  /**
   * Update employee
   */
  const saveQuestion = async () => {
    if (!params.value) {
      console.error('No employee parameters to save');
      return;
    }

    await controller.update(params.value, undefined, formKey);
  };

  const updateData = (updatedParams: EditQuestionParams) => {
    params.value = updatedParams;
  };

  onMounted(async () => {
    await controller.fetchOne(new ShowQuestionParams(Number(route.params.id)));
  });
</script>

<template>
  <div class="employee-edit-page">
    <QuestionsForm
      :question="controller.itemData.value!"
      :form-key="formKey"
      @update-data="updateData"
    />

    <div class="actions">
      <!-- <AppButton title="Update Employee" size="sm" icon="right" type="submit" @click="saveQuestion">
        Update Employee
        <template #icon>
          <IconAccept />
        </template>
      </AppButton> -->
      <button type="submit" @click="saveQuestion" class="btn btn-primary w-full">
        {{ $t('update_question') }}
      </button>
    </div>

    <!-- Error Display -->
    <div v-if="controller.errorMessage.value" class="error-toast">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .actions {
    margin-block: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .error-toast {
    margin-top: 20px;
    padding: 12px 16px;
    background-color: var(--error-light);
    color: var(--error-dark);
    border: 1px solid var(--error-border);
    border-radius: var(--radius-md);
    font-size: 0.9rem;
  }
</style>
