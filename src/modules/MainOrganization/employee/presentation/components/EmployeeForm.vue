<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { onBeforeRouteLeave, useRoute } from 'vue-router';
  import { useFormsStore } from '@/stores/formsStore';
  import DocumentIcon from '@/shared/icons/DocaumentType/DocumentIcon.vue';
  import type EmployeeModel from '../../core/models/employee.model';
  import AddEmployeeParams from '../../core/params/add.employee.params';
  import { EmployeeType } from '../../core/constants/type.enum';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import { useI18n } from 'vue-i18n';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';

  const emit = defineEmits<{
    updateData: [params: AddEmployeeParams];
  }>();
  const { t } = useI18n();

  const props = defineProps<{
    admin?: EmployeeModel;
    formKey?: string;
    loading?: boolean;
  }>();

  const route = useRoute();
  const formStore = useFormsStore();
  const name = ref('');
  const email = ref('');
  const phone = ref('');
  const password = ref('');
  const type = ref<EmployeeType>(EmployeeType.EMPLOYEE);
  const employeeTypeOptions = computed<TitleInterface<EmployeeType>[]>(() => [
    new TitleInterface<EmployeeType>({ id: EmployeeType.EMPLOYEE, title: t('employee.employee') }),
    new TitleInterface<EmployeeType>({ id: EmployeeType.ENGINEER, title: t('employee.engineer') }),
    new TitleInterface<EmployeeType>({ id: EmployeeType.SELLER, title: t('employee.seller') }),
    new TitleInterface<EmployeeType>({ id: EmployeeType.PRICING_RESPONSIBLE, title: t('employee.pricing_responsible') }),
    new TitleInterface<EmployeeType>({ id: EmployeeType.REVIEWER, title: t('employee.reviewer') }),
    new TitleInterface<EmployeeType>({ id: EmployeeType.TEAM_LEADER, title: t('employee.team_leader') }),
    new TitleInterface<EmployeeType>({ id: EmployeeType.SITE_ENGINEER, title: t('employee.site_engineer') }),
    new TitleInterface<EmployeeType>({ id: EmployeeType.PROJECT_MANAGER, title: t('employee.project_manager') }),

  ]);
  const selectedEmployeeType = ref<TitleInterface<EmployeeType> | null>(
    new TitleInterface<EmployeeType>({
      id: EmployeeType.EMPLOYEE,
      title: t('employee.employee'),
    }),
  );
  const updateData = () => {
    emit(
      'updateData',
      new AddEmployeeParams({
        name: name.value,
        email: email.value,
        phone: phone.value,
        password: password.value,
        type: type.value,
      }),
    );
  };

  onMounted(updateData);

  onBeforeRouteLeave((to, from) => {
    const savedData = props.formKey ? formStore.getFormData(props.formKey) : null;

    if (savedData && to.path !== from.path && props.formKey) {
      formStore.showReturnWarning(props.formKey);
    }
  });

  watch(
    () => props.admin,
    (admin) => {
      if (!admin) return;

      name.value = admin.name ?? '';
      email.value = admin.email ?? '';
      phone.value = admin.phone ?? '';
      password.value = '';

      type.value = admin.employee_type ?? EmployeeType.EMPLOYEE;

      selectedEmployeeType.value =
        employeeTypeOptions.value.find((option) => option.id === type.value) ?? null;

      updateData();
    },
    { immediate: true },
  );

  const updateEmployeeType = (value: TitleInterface<EmployeeType> | null) => {
    selectedEmployeeType.value = value;
    type.value = (value?.id as EmployeeType | undefined) ?? EmployeeType.EMPLOYEE;
    updateData();
  };
</script>

<template>
  <div class="document-form-card">
    <div class="document-form-header">
      <DocumentIcon />
      <div class="document-form-header-text">
        <h4>{{ $t('employee.form_title') }}</h4>
        <p>{{ $t('employee.form_description') }}</p>
      </div>
    </div>

    <!-- {{ selectedEmployeeType }} -->

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="admin-name">{{ $t('name') }}</label>
          <FieldHelpIcon :label="$t('name')" field-name="name" field-id="admin-name" />
        </span>
        <div class="input-wrap">
          <input
            id="admin-name"
            v-model="name"
            type="text"
            :placeholder="$t('admin.name_placeholder')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="admin-email">{{ $t('email') }}</label>
          <FieldHelpIcon :label="$t('email')" field-name="email" field-id="admin-email" />
        </span>
        <div class="input-wrap">
          <input
            id="admin-email"
            v-model="email"
            type="email"
            :placeholder="$t('email_placeholder')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="admin-phone">{{ $t('phone') }}</label>
          <FieldHelpIcon :label="$t('phone')" field-name="phone" field-id="admin-phone" />
        </span>
        <div class="input-wrap">
          <input
            id="admin-phone"
            v-model="phone"
            type="text"
            :placeholder="$t('phone_placeholder')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>

      <div v-if="!route.params.employee_id" class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="admin-password">{{ $t('password') }}</label>
          <FieldHelpIcon :label="$t('password')" field-name="password" field-id="admin-password" />
        </span>
        <div class="input-wrap">
          <input
            id="admin-password"
            v-model="password"
            type="password"
            :placeholder="$t('password_placeholder')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group">
        <UpdatedCustomInputSelect
          id="employee_type"
          :model-value="selectedEmployeeType"
          :label="$t('employee_type')"
          :static-options="employeeTypeOptions"
          :placeholder="$t('employee_type_placeholder')"
          @update:model-value="updateEmployeeType"
        />
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

  .form-fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;

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
