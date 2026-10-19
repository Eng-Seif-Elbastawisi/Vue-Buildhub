<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { onMounted, ref, watch } from 'vue';
  import { onBeforeRouteLeave, useRoute } from 'vue-router';
  import { useFormsStore } from '@/stores/formsStore';
  import DocumentIcon from '@/shared/icons/DocaumentType/DocumentIcon.vue';
  import type AdminModel from '../../core/models/admin.model';
  import AddAdminParams from '../../core/params/add.admin.params';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';

  const emit = defineEmits<{
    updateData: [params: AddAdminParams];
  }>();

  const props = defineProps<{
    admin?: AdminModel;
    formKey?: string;
    loading?: boolean;
  }>();

  const route = useRoute();
  const formStore = useFormsStore();
  const name = ref('');
  const email = ref('');
  const phone = ref('');
  const password = ref('');

  const updateData = () => {
    emit(
      'updateData',
      new AddAdminParams({
        name: name.value,
        email: email.value,
        phone: phone.value,
        password: password.value,
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
      updateData();
    },
    { immediate: true },
  );
</script>

<template>
  <StandardFormLayout class="document-form-card">
    <div class="document-form-header">
      <DocumentIcon />
      <div class="document-form-header-text">
        <h4>{{ $t('admin.form_title') }}</h4>
        <p>{{ $t('admin.form_description') }}</p>
      </div>
    </div>

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="admin-name">{{ $t('admin.name') }}</label>
          <FieldHelpIcon :label="$t('admin.name')" field-name="name" field-id="admin-name" />
        </span>
        <div class="input-wrap">
          <input
            id="admin-name"
            v-model="name"
            type="text"
            :placeholder="$t('admin.name_placeholder')"
            class="field-input workspace-control"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="admin-email">{{ $t('admin.email') }}</label>
          <FieldHelpIcon :label="$t('admin.email')" field-name="email" field-id="admin-email" />
        </span>
        <div class="input-wrap">
          <input
            id="admin-email"
            v-model="email"
            type="email"
            :placeholder="$t('admin.email_placeholder')"
            class="field-input workspace-control"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="admin-phone">{{ $t('admin.phone') }}</label>
          <FieldHelpIcon :label="$t('admin.phone')" field-name="phone" field-id="admin-phone" />
        </span>
        <div class="input-wrap">
          <input
            id="admin-phone"
            v-model="phone"
            type="text"
            :placeholder="$t('admin.phone_placeholder')"
            class="field-input workspace-control"
            @input="updateData"
          />
        </div>
      </div>

      <div v-if="!route.params.id" class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="admin-password">{{ $t('admin.password') }}</label>
          <FieldHelpIcon
            :label="$t('admin.password')"
            field-name="password"
            field-id="admin-password"
          />
        </span>
        <div class="input-wrap">
          <input
            id="admin-password"
            v-model="password"
            type="password"
            :placeholder="$t('admin.password_placeholder')"
            class="field-input workspace-control"
            @input="updateData"
          />
        </div>
      </div>
    </div>
  </StandardFormLayout>
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
  border-radius: var(--bh-radius-control);
  background: var(--bh-surface-raised);
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
