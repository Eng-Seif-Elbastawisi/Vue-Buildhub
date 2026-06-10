<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import type AddSkillsParams from '../../core/params/add.skills.params';
  import SkillsForm from './SkillsForm.vue';
  import SkillsController from '../controllers/skills.controller';

  const controller = SkillsController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;

  const params = ref<AddSkillsParams | null>(null);
  const loading = ref(false);

  /**
   * Save new employee
   */
  const saveEmployee = async () => {
    loading.value = true;
    try {
      if (!params.value) {
        console.error('No employee parameters to save');
        return;
      }

      await controller.create(params.value, undefined);
    } catch (error) {
      console.error('Error saving employee:', error);
    } finally {
      loading.value = false;
    }
  };

  const updateData = (updatedParams: AddSkillsParams) => {
    params.value = updatedParams;
  };
  const router = useRouter();
  const BackToIndex = (): void => {
    router.push({
      name: 'Skills',
    });
  };
</script>

<template>
  <div class="employee-add-page">
    <SkillsForm :form-key="formKey" :loading="loading" @update-data="updateData" />

    <div class="actions" :class="{ disabled: loading }">
      <button class="btn btn-primary" @click="saveEmployee">
        <span v-if="loading" class="loader-skills"></span>
        <span v-else>
          {{ $t('save') }}
        </span>
      </button>
      <button @click="BackToIndex" class="btn btn-cancel">{{ $t(`cancel`) }}</button>
    </div>
    <!-- <div class="actions" :class="{ disabled: loading }">
      <button  class="btn btn-primary w-full" type="submit" @click="saveDocument">
        <span v-if="loading" class="loader"></span> 
        <span v-else>
          {{ $t('save_document') }}
        </span>
      </button>
    </div> -->

    <div v-if="controller.errorMessage.value" class="error-toast">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .loader-skills {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    border: 8px solid;
    border-color: #000 #0000;
    animation: l1 1s infinite;
  }
  @keyframes l1 {
    to {
      transform: rotate(0.5turn);
    }
  }
  @keyframes l7 {
    to {
      transform: rotate(0.5turn);
    }
  }

  .actions {
    margin-top: 24px;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    width: 100%;
    button {
      width: 50%;
    }
    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.7;
    }
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
