<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddEmployeeParams from '../../core/params/add.labor.params.ts';
  import EditEmployeeParams from '../../core/params/edit.labor.params.ts';
  import ShowEmployeeParams from '../../core/params/show.labor.params.ts';
  import EmployeeController from '../controllers/labor.controller.ts';
  import EmployeeForm from './EmployeeForm.vue';

  const controller = EmployeeController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const employeeId = Number(route.params.employee_id);
  const params = ref<EditEmployeeParams | null>(null);
  const loading = ref(false);

  const updateData = (data: AddEmployeeParams) => {
    params.value = new EditEmployeeParams({
      id: employeeId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password || undefined,
      type: data.type,
    });
  };

  const saveAdmin = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.update(params.value, undefined, formKey);
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    await controller.fetchOne(new ShowEmployeeParams(employeeId));
  });
</script>

<template>
  <div class="employee-crud-page">
    <EmployeeForm
      :admin="controller.itemData.value!"
      :form-key="formKey"
      :loading="loading"
      @update-data="updateData"
    />

    <div class="actions" :class="{ disabled: loading }">
      <button
        :disabled="loading"
        :class="{ 'btn--loading': loading }"
        class="btn btn-primary w-full"
        type="button"
        @click="saveAdmin"
      >
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('employee.update') }}</span>
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
