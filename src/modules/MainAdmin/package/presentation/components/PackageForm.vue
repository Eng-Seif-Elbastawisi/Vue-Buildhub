<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';
  import { onBeforeRouteLeave } from 'vue-router';
  import { useFormsStore } from '@/stores/formsStore';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import DocumentIcon from '@/shared/icons/DocaumentType/DocumentIcon.vue';
  import type PackageModel from '../../core/models/package.model';
  import AddPackageParams from '../../core/params/add.package.params';

  const emit = defineEmits<{
    updateData: [params: AddPackageParams];
  }>();

  const props = defineProps<{
    packageData?: PackageModel;
    formKey?: string;
    loading?: boolean;
  }>();

  const formStore = useFormsStore();
  const duration = ref(0);
  const hasmobild = ref(false);
  const hasportal = ref(false);
  const projectnumbers = ref(0);
  const employeenumbers = ref(0);
  const price = ref('');

  const emitPackageParams = () => {
    emit(
      'updateData',
      new AddPackageParams({
        duration: duration.value,
        hasmobild: hasmobild.value,
        hasportal: hasportal.value,
        projectnumbers: projectnumbers.value,
        employeenumbers: employeenumbers.value,
        price: price.value,
      }),
    );
  };

  onMounted(emitPackageParams);

  onBeforeRouteLeave((to, from) => {
    if (!props.formKey || to.path === from.path) return;

    if (formStore.getFormData(props.formKey)) {
      formStore.showReturnWarning(props.formKey);
    }
  });

  watch(
    () => props.packageData,
    (packageData) => {
      if (!packageData) return;

      duration.value = packageData.duration;
      hasmobild.value = packageData.hasmobild;
      hasportal.value = packageData.hasportal;
      projectnumbers.value = packageData.projectnumbers;
      employeenumbers.value = packageData.employeenumbers;
      price.value = packageData.price;
      emitPackageParams();
    },
    { immediate: true },
  );
</script>

<template>
  <div class="package-form-card">
    <div class="package-form-header">
      <DocumentIcon />
      <div>
        <h4>{{ $t('package.form_title') }}</h4>
        <p>{{ $t('package.form_description') }}</p>
      </div>
    </div>

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="package-duration">{{ $t('package.duration') }}</label>
          <FieldHelpIcon
            :label="$t('package.duration')"
            field-name="duration"
            field-id="package-duration"
          />
        </span>
        <input
          id="package-duration"
          v-model.number="duration"
          class="field-input"
          min="0"
          type="number"
          :placeholder="$t('package.duration_placeholder')"
          @input="emitPackageParams"
        />
      </div>

      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="package-price">{{ $t('package.price') }}</label>
          <FieldHelpIcon :label="$t('package.price')" field-name="price" field-id="package-price" />
        </span>
        <input
          id="package-price"
          v-model="price"
          class="field-input"
          inputmode="decimal"
          type="text"
          :placeholder="$t('package.price_placeholder')"
          @input="emitPackageParams"
        />
      </div>

      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="package-projectnumbers">
            {{ $t('package.projectnumbers') }}
          </label>
          <FieldHelpIcon
            :label="$t('package.projectnumbers')"
            field-name="projectnumbers"
            field-id="package-projectnumbers"
          />
        </span>
        <input
          id="package-projectnumbers"
          v-model.number="projectnumbers"
          class="field-input"
          min="0"
          type="number"
          :placeholder="$t('package.projectnumbers_placeholder')"
          @input="emitPackageParams"
        />
      </div>

      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="package-employeenumbers">
            {{ $t('package.employeenumbers') }}
          </label>
          <FieldHelpIcon
            :label="$t('package.employeenumbers')"
            field-name="employeenumbers"
            field-id="package-employeenumbers"
          />
        </span>
        <input
          id="package-employeenumbers"
          v-model.number="employeenumbers"
          class="field-input"
          min="0"
          type="number"
          :placeholder="$t('package.employeenumbers_placeholder')"
          @input="emitPackageParams"
        />
      </div>

      <label class="toggle-field" for="package-hasmobild">
        <input
          id="package-hasmobild"
          v-model="hasmobild"
          type="checkbox"
          @change="emitPackageParams"
        />
        <span>{{ $t('package.hasmobild') }}</span>
      </label>

      <label class="toggle-field" for="package-hasportal">
        <input
          id="package-hasportal"
          v-model="hasportal"
          type="checkbox"
          @change="emitPackageParams"
        />
        <span>{{ $t('package.hasportal') }}</span>
      </label>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .package-form-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;

    p {
      color: var(--gray-5);
    }
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
    color: var(--bread-crumb-color-span);
    font-family: 'Medium';
    font-size: var(--sm-size);
    font-weight: 400;
    outline: none;
  }

  .toggle-field {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-height: 48px;
    padding: 0 1rem;
    border: 1px solid var(--border-weak);
    border-radius: 28px;
    cursor: pointer;
  }

  @media (max-width: 768px) {
    .form-fields {
      grid-template-columns: 1fr;
    }
  }
</style>
