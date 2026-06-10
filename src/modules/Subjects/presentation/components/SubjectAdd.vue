<script setup lang="ts">
  import { ref } from 'vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import IconAccept from '@/shared/icons/IconAccept.vue';
  import { useRoute } from 'vue-router';
  import SubjectController from '../controllers/subject.controller';
  import type AddSubjectParams from '../../core/params/add.subject.params';
  import SubjectForm from './SubjectForm.vue';

  // Controller instance
  const controller = SubjectController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  // Form state
  const params = ref<AddSubjectParams | null>(null);
  const loading = ref(false);
  /**
   * Save (create or update) email
   */
  const saveEmail = async () => {
    loading.value = true;
    try {
      if (!params.value) {
        console.error('No email parameters to save');
        return;
      }

      const paramsToSave = params.value;

      await controller.create(paramsToSave, undefined, formKey);
    } catch (error) {
      console.error('Error saving email:', error);
    } finally {
      loading.value = false;
    }
  };

  const updateData = (updatedParams: AddSubjectParams) => {
    params.value = updatedParams;
    // saveEmail();
  };
</script>

<template>
  <div class="email-crud-example">
    <SubjectForm
      :form-key="formKey"
      :subject="controller.itemData.value!"
      :loading="loading"
      @update-data="updateData"
    />

    <div class="actions" :class="{ disabled: loading }">
      <AppButton title="Save Email" size="sm" icon="right" type="submit" @click="saveEmail">
        Save Subject

        <template #icon>
          <IconAccept />
        </template>
      </AppButton>
    </div>

    <!-- Error Display -->
    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  :deep(.input-file) {
    border: 1px solid var(--input-file-border) !important;
    padding: 11px;
    border-radius: 20px !important;
    cursor: pointer;
  }

  .actions {
    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.7;
    }
  }

  /* .email-crud-example {
    padding: 20px;
    margin: 0 auto;
  }

  .email-list {
    margin-bottom: 30px;
  }

  .email-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border: 1px solid var(--crud-border);
    border-radius: 4px;
    margin-bottom: 10px;
  }

  .email-type {
    color: var(--crud-muted-text);
    font-size: 0.9em;
  }

  .actions {
    display: flex;
    gap: 10px;
  }

  .email-form {
    padding: 20px;
    border: 1px solid var(--border-weak);
    border-radius: 4px;
    background-color: var(--bg-section);
  }

  .email-form input,
  .email-form select {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid var(--border-weak);
    border-radius: 4px;
  }

  .form-actions {
    display: flex;
    gap: 10px;
  }

  button {
    padding: 8px 16px;
    background-color: var(--btn-action-bg);
    color: var(--BgWhite);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
  }

  button:hover {
    background-color: var(--btn-action-hover);
  }

  .error {
    margin-top: 20px;
    padding: 10px;
    background-color: var(--error-bg);
    color: var(--error-text);
    border: 1px solid var(--error-border);
    border-radius: 4px;
  } */
</style>
