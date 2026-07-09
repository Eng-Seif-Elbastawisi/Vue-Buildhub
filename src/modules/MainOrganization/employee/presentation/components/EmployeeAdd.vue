<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddEmployeeParams from '../../core/params/add.employee.params.ts';
  import EmployeeController from '../controllers/employee.controller.ts';
  import EmployeeForm from './EmployeeForm.vue';

  const controller = EmployeeController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const params = ref<AddEmployeeParams | null>(null);
  const loading = ref(false);

  const saveEmployee = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.create(params.value, undefined, formKey);
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <div class="employee-crud-page">
    <EmployeeForm :form-key="formKey" :loading="loading" @update-data="params = $event" />

    <div class="actions" :class="{ disabled: loading }">
      <button
        :disabled="loading"
        :class="{ 'btn--loading': loading }"
        class="btn btn-primary w-full"
        type="button"
        @click="saveEmployee"
      >
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('employee.save') }}</span>
      </button>
    </div>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .employee-crud-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .actions.disabled {
    pointer-events: none;
    opacity: 0.7;
  }

  .error {
    margin-top: 20px;
    padding: 10px;
    background-color: var(--danger-light);
    color: var(--danger-dark);
    border: 1px solid #f5c6cb;
    border-radius: 4px;
  }
</style>
