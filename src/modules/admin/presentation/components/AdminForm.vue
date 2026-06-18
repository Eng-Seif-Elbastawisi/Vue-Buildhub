<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { onBeforeRouteLeave, useRoute } from 'vue-router';
  import { useFormsStore } from '@/stores/formsStore';
  import DocumentIcon from '@/shared/icons/DocaumentType/DocumentIcon.vue';
  import type AdminModel from '../../core/models/admin.model';
  import AddAdminParams from '../../core/params/add.admin.params';

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
  <div class="document-form-card">
    <div class="document-form-header">
      <DocumentIcon />
      <div class="document-form-header-text">
        <h4>{{ $t('admin.form_title') }}</h4>
        <p>{{ $t('admin.form_description') }}</p>
      </div>
    </div>

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group">
        <label class="field-label" for="admin-name">{{ $t('admin.name') }}</label>
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
        <label class="field-label" for="admin-email">{{ $t('admin.email') }}</label>
        <div class="input-wrap">
          <input
            id="admin-email"
            v-model="email"
            type="email"
            :placeholder="$t('admin.email_placeholder')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group">
        <label class="field-label" for="admin-phone">{{ $t('admin.phone') }}</label>
        <div class="input-wrap">
          <input
            id="admin-phone"
            v-model="phone"
            type="text"
            :placeholder="$t('admin.phone_placeholder')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>

      <div v-if="!route.params.id" class="field-group">
        <label class="field-label" for="admin-password">{{ $t('admin.password') }}</label>
        <div class="input-wrap">
          <input
            id="admin-password"
            v-model="password"
            type="password"
            :placeholder="$t('admin.password_placeholder')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
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
