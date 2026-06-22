<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import type AddEmployeeParams from '../../core/params/add.employee.params.ts';
import EditEmployeeParams from '../../core/params/edit.employee.params.ts';
import ShowEmployeeParams from '../../core/params/show.employee.params.ts';
import EmployeeController from '../controllers/employee.controller.ts';
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
    {{ route.params.employee_id}}vv  
    <EmployeeForm :admin="controller.itemData.value!" :form-key="formKey" :loading="loading" @update-data="updateData" />

    <div class="actions" :class="{ disabled: loading }">
      <button class="btn btn-primary w-full" type="button" @click="saveAdmin">
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
.admin-crud-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.actions.disabled {
  pointer-events: none;
  opacity: 0.7;
}

.error {
  color: var(--danger-dark);
}
</style>
