<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import questionsController from '../controllers/questions.controller';
  import questionsForm from './questionsForm.vue';
  import type AddEmployeeParams from '../../core/params/add.question.params';
  import LoadingIcon from '@/assets/images/loading.webp';


  const controller = questionsController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const loading = ref(false);
  const params = ref<AddEmployeeParams | null>(null);
  const router = useRouter();
 


  const saveQuestion = async () => {
    loading.value = true;
    try {
      if (!params.value) {
        console.error('No employee parameters to save');
        return;
      }

      await controller.create(params.value, undefined, formKey);
    } catch (error) {
      console.error('Error saving employee:', error);
    } finally {
      loading.value = false;
    }
  };

  const saveAsDraft = async () => {
    loading.value = true;
    try {
      if (!params.value) {
        console.error('No question parameters to save');
        return;
      }

      localStorage.setItem(`question-draft`, JSON.stringify(params.value));
      router.push({ name: 'Questions' });
    } catch (error) {
      console.error('Error saving employee:', error);
    } finally {
      loading.value = false;
    }
  };
  const updateData = (updatedParams: AddEmployeeParams) => {
    params.value = updatedParams;
  };

</script>


<template>
  <div class="questions-add-page">
    <questionsForm
      :class="loading ? 'disabled' : ''"
      :form-key="formKey"
      @update-data="updateData"
    />
    <div class="actions">
      <button
        class="btn btn-primary save-emp"
        :disabled="loading"
        :class="loading ? 'disabled' : ''"
        @click="saveQuestion"
      >
        <img
          v-if="loading"
          :src="LoadingIcon"
          class="loader-skills"
          alt="loading"
          width="30"
          height="30"
        />
        <span v-else> {{ $t(`save_question`) }} </span>
      </button>
      <button
        class="btn btn-draft"
        :disabled="loading"
        :class="loading ? 'disabled' : ''"
        @click="saveAsDraft"
      >
        {{ $t(`Save As draft`) }}
      </button>
      <button
        class="btn btn-cancel"
        :disabled="loading"
        :class="loading ? 'disabled' : ''"
        @click="$router.push({ name: 'Questions' })"
      >
        {{ $t(`cancel`) }}
      </button>
    </div>

    <!-- Error Display -->
    <div v-if="controller.errorMessage.value" class="error-toast">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .btn-cancel {
    background-color: var(--background-btn-outline-color);
    color: var(--danger-color);
    border: 1px solid rgba(245, 194, 192, 1);
    border-radius: 50px;
    width: 20%;

    @media (max-width: 768px) {
      width: 50%;
    }
  }

  .btn-draft {
    background-color: var(--PrimaryColor-alpha-10);
    color: var(--PrimaryColor);
    border: 1px solid var(--PrimaryColor-alpha-10);
    border-radius: 50px;
    width: 20%;

    @media (max-width: 768px) {
      width: 50%;
    }
  }

  .save-emp {
    width: 60%;
  }

  .disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .actions {
    margin-block: 18px;
    display: flex;
    gap: 10px;
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
