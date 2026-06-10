<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  // import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  // import IconAccept from '@/shared/icons/IconAccept.vue';
  import EmployeeController from '../controllers/employee.controller';
  import type EditEmployeeParams from '../../core/params/edit.employee.params';
  import ShowEmployeeParams from '../../core/params/show.employee.params';
  import EmployeeForm from './EmployeeForm.vue';

  const controller = EmployeeController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;

  const params = ref<EditEmployeeParams | null>(null);
  const loading = ref(false);
  /**
   * Update employee
   */
  const saveEmployee = async () => {
    if (!params.value) {
      console.error('No employee parameters to save');
      return;
    }

    loading.value = true;
    await controller.update(params.value, undefined, formKey);
    loading.value = false;
  };

  const updateData = (updatedParams: EditEmployeeParams) => {
    params.value = updatedParams;
  };

  onMounted(async () => {
    await controller.fetchOne(new ShowEmployeeParams(Number(route.params.id)));
  });
</script>

<template>
  <div class="employee-edit-page">
    <EmployeeForm
      :employee="controller.itemData.value!"
      :form-key="formKey"
      :loading="loading"
      @update-data="updateData"
    />

    <div class="actions" :class="{ disabled: loading }">
      <!-- <AppButton
        title="Update Employee"
        :loading="loading"
        size="sm"
        icon="right"
        type="submit"
        @click="saveEmployee"
      >
        Update Employee
        <template #icon>
          <IconAccept />
        </template>
      </AppButton> -->
      <button  class="btn btn-primary w-full" type="submit" @click="saveEmployee">
        <span v-if="loading" class="loader"></span> 
        <span v-else>
          {{ $t('update_employee') }}
        </span>
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
  @keyframes l1 {to{transform: rotate(.5turn)}}
  @keyframes l7 {to{transform: rotate(.5turn)}}
  // .employee-edit-page {
  //   padding: 24px;
  //   max-width: 1000px;
  //   margin: 0 auto;
  // }

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
