<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { onBeforeRouteLeave } from 'vue-router';
  import { useFormsStore } from '@/stores/formsStore';
  import type ClientShowModel from '../../core/models/client.show.model';
  import AddClientParams from '../../core/params/add.client.params';
  import { ClientTypeEnum } from '../../core/constant/client.type.enum';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import { useI18n } from 'vue-i18n';
  import DocumentIcon from '@/shared/icons/DocaumentType/DocumentIcon.vue';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';

  const emit = defineEmits<{
    updateData: [params: AddClientParams];
  }>();

  const props = defineProps<{
    client?: ClientShowModel;
    formKey?: string;
    loading?: boolean;
  }>();

  const formStore = useFormsStore();
  // const brandController = BrandController.getInstance();
  // const brandParams = new IndexBrandParams('', 1, 100, 0, undefined, 1);
  // const unitOptions = Object.entries(UnitTypeEnum).map(([title, id]) => ({ id, title }));

  const name = ref<string | undefined>('');
  const phone = ref<string>('');
  const email = ref<string | undefined>('');
  const address = ref<string | undefined>('');
  const selectedType = ref<TitleInterface<number> | null>(null);
  // const typeOptions = Object.entries(ClientTypeEnum).map(([title, id]) => ({ id: Number(id), title }));
  const { t } = useI18n();
  const typeOptions = computed<TitleInterface<number>[]>(() => [
    new TitleInterface({
      id: ClientTypeEnum.INDIVIDUAL,
      title: t('INDIVIDUAL'),
    }),
    new TitleInterface({
      id: ClientTypeEnum.COMPANY,
      title: t('COMPANY'),
    }),
    new TitleInterface({
      id: ClientTypeEnum.DEVELOPER,
      title: t('DEVELOPER'),
    }),
  ]);

  onBeforeRouteLeave((to, from) => {
    const savedData = props.formKey ? formStore.getFormData(props.formKey) : null;
    if (savedData && to.path !== from.path && props.formKey) {
      formStore.showReturnWarning(props.formKey);
    }
  });

  watch(
    () => props.client,
    (client) => {
      if (!client) return;

      name.value = client.name;
      phone.value = String(client.phone ?? '');
      email.value = client.email;
      address.value = client.address;

      selectedType.value = typeOptions.value.find((item) => item.id === client.type) ?? null;
    },
    { immediate: true },
  );

  const updateData = () => {
    emit(
      'updateData',
      new AddClientParams({
        phone: String(phone.value ?? ''),
        name: name.value,
        email: email.value,
        address: address.value,
        type: selectedType.value?.id as ClientTypeEnum,
      }),
    );
  };
</script>

<template>
  <div class="material-form-card">
    <div class="document-form-header">
      <DocumentIcon />
      <header class="form-header">
        <h3>{{ $t('client.form_title') }}</h3>
        <p>{{ $t('client.form_description') }}</p>
      </header>
    </div>

    <div class="form-fields" :class="{ disabled: loading }">
      <!-- <div class="field-group col-span-2">
        <MultiLangInput field-key="title" :label="$t('client.name')" :languages="['en', 'ar']"
          :model-value="name" type="title" @update:model-value="updateData" />
      </div> -->
      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="name">{{ $t(`client.name`) }}</label>
          <FieldHelpIcon :label="$t('client.name')" field-name="name" field-id="name" />
        </span>
        <div class="input-wrap">
          <input
            id="name"
            v-model="name"
            type="text"
            :placeholder="$t('client.name_placeholder')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="material-price">{{ $t('client.phone') }}</label>
          <FieldHelpIcon :label="$t('client.phone')" field-name="phone" field-id="material-price" />
        </span>
        <div class="input-wrap">
          <input
            id="material-price"
            v-model="phone"
            class="field-input"
            min="0"
            step="0.01"
            type="tel"
            :placeholder="$t('client.phone_placeholder')"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="email">{{ $t('client.email') }}</label>
          <FieldHelpIcon :label="$t('client.email')" field-name="email" field-id="email" />
        </span>
        <div class="input-wrap">
          <input
            id="email"
            v-model="email"
            type="email"
            :placeholder="$t('client.email_placeholder')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="address">{{ $t('client.address') }}</label>
          <FieldHelpIcon :label="$t('client.address')" field-name="address" field-id="address" />
        </span>
        <div class="input-wrap">
          <input
            id="address"
            v-model="address"
            type="text"
            :placeholder="$t('client.address_placeholder')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>
      <div class="field-group">
        <UpdatedCustomInputSelect
          id="type"
          v-model="selectedType"
          :label="$t('client.type')"
          :placeholder="$t('client.type_placeholder')"
          :static-options="typeOptions"
          required
          @update:model-value="updateData"
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

  .field-input {
    width: 100%;
    padding: 12px 16px;
    padding-right: 50px;
    border: 1px solid var(--border-weak);
    border-radius: 28px;
    background: var(--white);
    outline: none;
    transition: all 0.25s ease;
    font-family: 'Medium';
    font-weight: 400;
    font-size: var(--sm-size);
    color: var(--bread-crumb-color-span);
    max-height: 200px;
    max-width: 100%;
  }

  .material-form-card {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-header p {
    color: var(--gray-5);
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

  .col-span-2 {
    grid-column: span 2;
  }

  @media (max-width: 768px) {
    .form-fields {
      grid-template-columns: 1fr;
    }

    .col-span-2 {
      grid-column: span 1;
    }
  }
</style>
