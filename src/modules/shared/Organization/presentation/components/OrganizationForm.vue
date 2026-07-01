<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { onBeforeRouteLeave, useRoute } from 'vue-router';
  import { useFormsStore } from '@/stores/formsStore';
  import DocumentIcon from '@/shared/icons/DocaumentType/DocumentIcon.vue';
  import type OrganizationShowModel from '../../core/models/organization.show.model';
  import AddOrganizationParams from '../../core/params/add.organization.params';

  const emit = defineEmits<{
    updateData: [params: AddOrganizationParams];
  }>();

  const props = defineProps<{
    organization?: OrganizationShowModel;
    formKey?: string;
    loading?: boolean;
  }>();

  const route = useRoute();

  const formStore = useFormsStore();

  const name = ref<string>('');
  const address = ref<string>('');
  const employee_name = ref<string>('');
  const employee_email = ref<string>('');
  const employee_phone = ref<string>('');
  const employee_password = ref<string>('');

  onBeforeRouteLeave((to, from) => {
    const savedData = props.formKey ? formStore.getFormData(props.formKey) : null;

    if (savedData && to.path !== from.path && props.formKey) {
      formStore.showReturnWarning(props.formKey);
    }
  });

  const updateData = () => {
    emit(
      'updateData',
      new AddOrganizationParams({
        name: name.value,
        employee_name: employee_name.value,
        employee_email: employee_email.value,
        employee_phone: employee_phone.value,
        employee_password: employee_password.value,
        address: address.value,
      }),
    );
  };

  watch(
    () => props.organization,
    (organization) => {
      if (!organization) return;

      name.value = organization.name ?? '';
      employee_name.value = organization.default_employee.name ?? '';
      employee_email.value = organization.default_employee.employee_email ?? '';
      employee_phone.value = organization.default_employee.employee_phone ?? '';
      // employee_password.value = organization.default_employee.employee_password ?? '';
      address.value = organization.address ?? '';
      updateData();
    },
    { immediate: true },
  );
</script>

<template>
  <div class="document-form-card">
    <div class="document-form-header">
      <DocumentIcon />

      <div class="document-form-header-text">
        <h4>{{ $t('organization.form_title') }}</h4>
        <p>{{ $t('organization.form_description') }}</p>
      </div>
    </div>

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group">
        <label class="field-label" for="organization-name">{{ $t('Name') }}</label>
        <div class="input-wrap">
          <input
            id="organization-name"
            v-model="name"
            type="text"
            :placeholder="$t('organization.name_placeholder')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group">
        <label class="field-label" for="organization-address">
          {{ $t('address') }}
        </label>
        <div class="input-wrap">
          <input
            id="organization-address"
            v-model="address"
            type="text"
            :placeholder="$t('organization.address_placeholder')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group" :class="{ hidden: route.params.id }">
        <label class="field-label" for="organization-employee_name">{{
          $t('employee_name')
        }}</label>
        <div class="input-wrap">
          <input
            id="organization-employee_name"
            v-model="employee_name"
            type="text"
            :placeholder="$t('organization.employee_name_placeholder')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group" :class="{ hidden: route.params.id }">
        <label class="field-label" for="organization-employee_email">{{
          $t('employee_email')
        }}</label>
        <div class="input-wrap">
          <input
            id="organization-employee_email"
            v-model="employee_email"
            type="email"
            :placeholder="$t('organization.employee_email_placeholder')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group" :class="{ hidden: route.params.id }">
        <label class="field-label" for="organization-employee_phone">{{
          $t('employee_phone')
        }}</label>
        <div class="input-wrap">
          <input
            id="organization-employee_phone"
            v-model="employee_phone"
            type="text"
            :placeholder="$t('organization.employee_phone_placeholder')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group" :class="{ hidden: route.params.id }">
        <label class="field-label" for="organization-employee_password">{{
          $t('employee_password')
        }}</label>
        <div class="input-wrap">
          <input
            id="organization-employee_password"
            v-model="employee_password"
            type="password"
            :placeholder="$t('organization.employee_password_placeholder')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .hidden {
    display: none;
  }

  .form-fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;

    &.disabled {
      pointer-events: none;
      opacity: 0.7;
    }
  }

  .field-input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--border-weak);
    border-radius: 28px;
    background: var(--white);
    outline: none;
    transition: all 0.25s ease;
    font-family: 'Medium';
    font-weight: 400;
    font-size: var(--sm-size);
    color: var(--bread-crumb-color-span);
  }

  @media (max-width: 768px) {
    .form-fields {
      grid-template-columns: 1fr;
    }
  }
</style>
