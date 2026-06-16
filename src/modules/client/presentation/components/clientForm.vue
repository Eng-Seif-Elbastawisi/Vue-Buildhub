<script setup lang="ts">
import { ref, watch } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { useFormsStore } from '@/stores/formsStore';
import type MaterialsShowModel from '../../core/models/client.show.model';
import AddClientParams from '../../core/params/add.client.params';

const emit = defineEmits<{
  updateData: [params: AddClientParams];
}>();

const props = defineProps<{
  client?: MaterialsShowModel;
  formKey?: string;
  loading?: boolean;
}>();

const formStore = useFormsStore();
// const brandController = BrandController.getInstance();
// const brandParams = new IndexBrandParams('', 1, 100, 0, undefined, 1);
// const unitOptions = Object.entries(UnitTypeEnum).map(([title, id]) => ({ id, title }));

const name = ref<string | undefined>(''); 
const phone = ref<number | undefined>(undefined);
const email = ref<string | undefined>('');
const address = ref<string | undefined>(''); 

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
    phone.value = client.phone;
    email.value = client.email;
    address.value = client.address;
  },
  { immediate: true },
);

const updateData = () => {
  emit(
    'updateData',
    new AddClientParams({
      phone: phone.value,
      name: name.value,
      email: email.value,
      address: address.value,
    }),
  );
};
</script>

<template>
  <div class="material-form-card">
    <header class="form-header">
      <h3>{{ $t('client.form_title') }}</h3>
      <p>{{ $t('client.form_description') }}</p>
    </header>

    <div class="form-fields" :class="{ disabled: loading }">
      <!-- <div class="field-group col-span-2">
        <MultiLangInput field-key="title" :label="$t('client.name')" :languages="['en', 'ar']"
          :model-value="name" type="title" @update:model-value="updateData" />
      </div> -->
      <div class="field-group col-span-2">
        <label class="field-label" for="name">{{ $t(`client.name`) }}</label>
        <div class="input-wrap">
          <input id="name" v-model="name" type="text" :placeholder="$t('client.name_placeholder')"
            class="field-input" @input="updateData" />
        </div>
      </div>

      <div class="field-group">
        <label class="field-label" for="material-price">{{ $t('client.phone') }}</label>
        <div class="input-wrap">
          <input id="material-price" v-model.number="phone" class="field-input" min="0" step="0.01" type="number"
            :placeholder="$t('client.phone_placeholder')" @input="updateData" />
        </div>
      </div>

        <div class="field-group">
        <label class="field-label" for="email">{{ $t('client.email') }}</label>
        <div class="input-wrap">
          <input id="email" v-model="email" type="email" :placeholder="$t('client.email_placeholder')"
            class="field-input" @input="updateData" />
        </div>
      </div>

      <div class="field-group">
        <label class="field-label" for="address">{{ $t('client.address') }}</label>
        <div class="input-wrap">
          <input id="address" v-model="address" type="text" :placeholder="$t('client.address_placeholder')"
            class="field-input" @input="updateData" />
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped lang="scss">
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
