<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';
  import { onBeforeRouteLeave, useRoute } from 'vue-router';
  import { useFormsStore } from '@/stores/formsStore';
  import type CountryModel from '../../core/models/country.model';
  import AddCountryParams from '../../core/params/add.country.params';

  const emit = defineEmits(['updateData']);

  const { country, formKey, loading } = defineProps<{
    country?: CountryModel;
    formKey?: string;
    loading?: boolean;
  }>();

  const FormStore = useFormsStore();

  onBeforeRouteLeave((to, from) => {
    const savedData = FormStore.getFormData(formKey!);

    if (savedData && to.path !== from.path) {
      FormStore.showReturnWarning(formKey!);
    }
  });

  // Form state
  const title = ref<string>('');
  const code = ref<string>('');
  const flag = ref<string>('');

  watch(
    () => country,
    (newCountry) => {
      if (newCountry) {
        title.value = newCountry.title ?? '';
        code.value = newCountry.code!;
        flag.value = newCountry.flag!;
      }
    },
    { immediate: true },
  );

  const route = useRoute();

  const updateData = () => {
    FormStore.setFormData(formKey!, {
      title: title.value,
      code: code.value,
      flag: flag.value,
    });

    const params = new AddCountryParams({
      title: title.value!,
      code: code.value,
      flag: flag.value,
    });

    emit('updateData', params);
  };

  const resetForm = () => {
    title.value = '';
    code.value = '';
    flag.value = '';
  };

  onMounted(() => {
    const saved = FormStore.getFormData(formKey!);

    if (saved) {
      title.value = saved.title;
      code.value = saved.code;
      flag.value = saved.flag;
      updateData();
    } else {
      resetForm();
    }
  });
</script>

<template>
  <div class="email-form-card">
    <!-- ── Card Header ───────────────────────────────────── -->
    <header class="form-header">
      <div class="header-text">
        <h3>{{ route.params.id ? $t('Edit Country') : $t('Add New Country') }}</h3>
        <p class="header-subtitle">
          {{ route.params.id ? $t('update_country_details') : $t('fill_country_details') }}
        </p>
      </div>
      <span v-if="route.params.id" class="edit-badge">{{ $t('Editing') }}</span>
    </header>

    <!-- ── Divider ───────────────────────────────────────── -->
    <div class="form-divider" />

    <!-- ── Fields ────────────────────────────────────────── -->
    <div class="form-fields">
      <!-- Email Field -->
      <div class="field-group" :class="{ disabled: loading }">
        <label class="field-label" for="title"> {{ $t('Country Title') }} </label>
        <div class="input-wrap">
          <input
            id="title"
            v-model="title"
            type="text"
            :placeholder="$t('Country Title')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group" :class="{ disabled: loading }">
        <label class="field-label" for="code"> {{ $t('Country Code') }} </label>
        <div class="input-wrap">
          <input
            id="code"
            v-model="code"
            type="text"
            :placeholder="$t('Country Code')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group" :class="{ disabled: loading }">
        <label class="field-label" for="flag"> {{ $t('Country Flag') }} </label>
        <div class="input-wrap">
          <input
            id="flag"
            v-model="flag"
            type="text"
            :placeholder="$t('Country Flag')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .field-group {
    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.7;
    }
  }
</style>
