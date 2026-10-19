<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import IconAccept from '@/shared/icons/IconAccept.vue';
  import type AddOrganizationParams from '../../core/params/add.organization.params.ts';
  import OrganizationController from '../controllers/organization.controller.ts';
  import EditOrganizationParams from '../../core/params/edit.organization.params.ts';
  import ShowOrganizationParams from '../../core/params/show.organization.params.ts';
  import OrganizationForm from './OrganizationForm.vue';

  const controller = OrganizationController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;

  const params = ref<EditOrganizationParams | null>(null);
  const loading = ref(false);

  const saveOrganization = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.update(params.value, undefined, formKey);
    } finally {
      loading.value = false;
    }
  };

  const updateData = (updatedParams: AddOrganizationParams) => {
    params.value = new EditOrganizationParams({
      organization_id: Number(route.params.id),
      name: updatedParams.name ?? '',
      address: updatedParams.address ?? '',
      employee_name: updatedParams.employee_name ?? '',
      employee_phone: updatedParams.employee_phone ?? '',
      employee_email: updatedParams.employee_email ?? '',
    });
  };

  onMounted(async () => {
    await controller.fetchOne(
      new ShowOrganizationParams({ organization_id: Number(route.params.id), allLocales: true }),
    );
  });
</script>

<template>
  <StandardFormLayout mode="edit" class="document-crud-example">
    <OrganizationForm
      :organization="controller.itemData.value!"
      :form-key="formKey"
      :loading="loading"
      @update-data="updateData"
    />

    <!-- <div class="actions" :class="{ disabled: loading }">
      <AppButton
        :loading="loading"
        :title="$t('supplier.update')"
        size="sm"
        icon="right"
        type="submit"
        @click="saveDocument"
      >
        {{ $t('supplier.update') }}
        <template #icon>
          <IconAccept />
        </template>
</AppButton>
</div> -->

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>

    <template #actions>
      <div class="actions" :class="{ disabled: loading }">
        <button
          :disabled="loading"
          :class="{ 'btn--loading': loading }"
          class="btn btn-primary w-full"
          type="submit"
          @click="saveOrganization"
        >
          <span v-if="loading" class="loader"></span>
          <span v-else>
            {{ $t('organization.update') }}
            <IconAccept />
          </span>
        </button>
      </div>
    </template>
  </StandardFormLayout>
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

.email-crud-example {
  padding: 20px;
  margin: 0 auto;
}

.actions {
  &.disabled {
    cursor: not-allowed;
    pointer-events: none;
    opacity: 0.7;
  }
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
