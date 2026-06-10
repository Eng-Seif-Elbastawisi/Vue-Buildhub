<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import AboutController from '../controllers/about.controller';
  import type AddAboutParams from '../../core/params/add.about.params';
  import AboutForm from './AboutForm.vue';

  const controller = AboutController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;

  const params = ref<AddAboutParams | null>(null);
  const loading = ref(false);
  const router = useRouter();
  /**
   * Save new employee
   */
  const saveAbout = async () => {
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
      router.push({ name: 'About' });
    }
  };

  const updateData = (updatedParams: AddAboutParams) => {
    params.value = updatedParams;
  };
</script>

<template>
  <div class="employee-add-page">
    <AboutForm :form-key="formKey" :loading="loading" @update-data="updateData" />

    <div class="actions" :class="{ disabled: loading }">
      <!-- <AppButton title="Save Employee" size="sm" icon="right" type="submit" @click="saveEmployee">
        Save Employee
        <template #icon>
          <IconAccept />
        </template>
</AppButton> -->
      <button class="btn btn-primary w-full" type="submit" @click="saveAbout">
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('save') }}</span>
      </button>
    </div>

    <!-- Error Display -->
    <div v-if="controller.errorMessage.value" class="error-toast">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .loader {
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
    justify-content: flex-end;
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
