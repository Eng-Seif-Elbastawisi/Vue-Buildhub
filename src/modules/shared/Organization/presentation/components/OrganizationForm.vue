<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';
  import { onBeforeRouteLeave, useRoute } from 'vue-router';
  import { useFormsStore } from '@/stores/formsStore';
  import DocumentIcon from '@/shared/icons/DocaumentType/DocumentIcon.vue';
  import type OrganizationShowModel from '../../core/models/organization.show.model';
  import AddOrganizationParams from '../../core/params/add.organization.params';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import HandleFilesUpload, { type UploadedFile } from '@/shared/FormInputs/HandleFilesUpload.vue';

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
  const logo = ref<string>('');
  const existingLogoFiles = ref<string[]>([]);
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

        logo: logo.value || undefined,
      }),
    );
  };

  onMounted(updateData);

  watch(
    () => props.organization,
    (organization) => {
      if (!organization) return;

      const organizationData = organization as any;

      name.value = organization.name ?? '';
      employee_name.value = organization.default_employee.name ?? '';
      employee_email.value = organization.default_employee.employee_email ?? '';
      employee_phone.value = organization.default_employee.employee_phone ?? '';
      address.value = organization.address ?? '';

      existingLogoFiles.value = organizationData.logo ? [organizationData.logo] : [];

      logo.value = '';

      updateData();
    },
    { immediate: true },
  );
  const updateLogo = (files: UploadedFile[]) => {
    const firstFile = files[0];

    logo.value =
      firstFile?.base64 && firstFile.base64.startsWith('data:image/') ? firstFile.base64 : '';

    updateData();
  };
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
      <div class="field-group col-span-2">
        <HandleFilesUpload
          id="logo"
          label="logo"
          class-name="w-full"
          accept="image/*"
          :max-files="1"
          :multiple="false"
          :file="existingLogoFiles"
          @change="updateLogo"
        />
      </div>
      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="organization-name">{{ $t('Name') }}</label>
          <FieldHelpIcon :label="$t('Name')" field-name="name" field-id="organization-name" />
        </span>
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
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="organization-address">
            {{ $t('address') }}
          </label>
          <FieldHelpIcon
            :label="$t('address')"
            field-name="address"
            field-id="organization-address"
          />
        </span>
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
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="organization-employee_name">{{
            $t('employee_name')
          }}</label>
          <FieldHelpIcon
            :label="$t('employee_name')"
            field-name="name"
            field-id="organization-employee_name"
          />
        </span>
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
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="organization-employee_email">{{
            $t('employee_email')
          }}</label>
          <FieldHelpIcon
            :label="$t('employee_email')"
            field-name="email"
            field-id="organization-employee_email"
          />
        </span>
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
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="organization-employee_phone">{{
            $t('employee_phone')
          }}</label>
          <FieldHelpIcon
            :label="$t('employee_phone')"
            field-name="phone"
            field-id="organization-employee_phone"
          />
        </span>
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
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="organization-employee_password">{{
            $t('employee_password')
          }}</label>
          <FieldHelpIcon
            :label="$t('employee_password')"
            field-name="password"
            field-id="organization-employee_password"
          />
        </span>
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
  .document-form-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

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
