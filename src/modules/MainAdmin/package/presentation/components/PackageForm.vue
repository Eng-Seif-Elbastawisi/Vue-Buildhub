<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { computed, ref, watch } from 'vue';
  import { onBeforeRouteLeave } from 'vue-router';
  import { useI18n } from 'vue-i18n';

  import { useFormsStore } from '@/stores/formsStore';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import TranslationParams from '@/base/Core/Params/translationParams';

  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import DocumentIcon from '@/shared/icons/DocaumentType/DocumentIcon.vue';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';

  import AddPackageParams from '../../core/params/add.package.params';

  import { DurationType } from '../../core/constants/duration.type.enum';
  import { DiscountType } from '../../core/constants/discount.type.enum';
  import type PackageShowModel from '../../core/models/package.show.model';
  type SelectValue = TitleInterface<number> | TitleInterface<number>[] | null;

  type NumericEnum = Record<string, string | number>;

  const emit = defineEmits<{
    updateData: [params: AddPackageParams];
  }>();

  const props = defineProps<{
    packageData?: PackageShowModel;
    formKey?: string;
    loading?: boolean;
  }>();

  const { t, te } = useI18n();

  const formStore = useFormsStore();

  const titleTranslations = ref<Record<string, string>>({});

  const duration = ref(0);
  const price = ref('');

  const projectnumbers = ref(0);
  const employeenumbers = ref(0);

  const hasmobild = ref(false);
  const hasportal = ref(false);

  const discountValue = ref<string | number>('');

  const selectedDurationType = ref<TitleInterface<number> | null>(null);

  const selectedDiscountType = ref<TitleInterface<number> | null>(null);

  const formatEnumName = (enumName: string): string => {
    const formattedName = enumName.toLowerCase().replaceAll('_', ' ');

    return formattedName.replace(/\b\w/g, (character) => character.toUpperCase());
  };

  const createEnumOptions = (
    enumObject: NumericEnum,
    translationPrefix: string,
  ): TitleInterface<number>[] => {
    return Object.entries(enumObject)
      .filter(([key, value]) => Number.isNaN(Number(key)) && typeof value === 'number')
      .map(([key, value]) => {
        const translationKey = `${translationPrefix}.${key.toLowerCase()}`;

        return new TitleInterface<number>({
          id: value as number,

          title: te(translationKey) ? t(translationKey) : formatEnumName(key),
        });
      });
  };

  const durationTypeOptions = computed<TitleInterface<number>[]>(() =>
    createEnumOptions(DurationType, 'package.duration_types'),
  );

  const discountTypeOptions = computed<TitleInterface<number>[]>(() =>
    createEnumOptions(DiscountType, 'package.discount_types'),
  );

  const toSingleOption = (value: SelectValue): TitleInterface<number> | null => {
    if (Array.isArray(value)) {
      return value[0] ?? null;
    }

    return value;
  };

  const findOption = (
    options: TitleInterface<number>[],
    value: number,
  ): TitleInterface<number> | null => {
    return options.find((option) => Number(option.id) === Number(value)) ?? null;
  };

  const emitPackageParams = (): void => {
    if (!selectedDurationType.value || !selectedDiscountType.value) {
      return;
    }

    emit(
      'updateData',
      new AddPackageParams({
        duration: duration.value,

        duration_type: Number(selectedDurationType.value.id) as DurationType,

        hasmobild: hasmobild.value,
        hasportal: hasportal.value,

        projectnumbers: projectnumbers.value,

        employeenumbers: employeenumbers.value,

        price: price.value,

        discount_type: Number(selectedDiscountType.value.id) as DiscountType,

        discount_value: discountValue.value,

        translations: new TranslationParams({
          title: titleTranslations.value,
        }),
      }),
    );
  };

  const updateDurationType = (value: SelectValue): void => {
    selectedDurationType.value = toSingleOption(value);

    emitPackageParams();
  };

  const updateDiscountType = (value: SelectValue): void => {
    selectedDiscountType.value = toSingleOption(value);

    emitPackageParams();
  };

  const updateTitleTranslations = (value: Record<string, string>): void => {
    titleTranslations.value = value;

    emitPackageParams();
  };

  const fillFormFromPackage = (packageData: PackageShowModel): void => {
    duration.value = packageData.duration;

    selectedDurationType.value = findOption(durationTypeOptions.value, packageData.duration_type);

    hasmobild.value = packageData.hasmobild;
    hasportal.value = packageData.hasportal;

    projectnumbers.value = packageData.projectnumbers;

    employeenumbers.value = packageData.employeenumbers;

    price.value = packageData.price;

    selectedDiscountType.value = findOption(discountTypeOptions.value, packageData.discount_type);

    discountValue.value = packageData.discount_value;
    titleTranslations.value = {
      ...(packageData.translations?.title ?? {}),
    };
  };

  watch(
    () => props.packageData,
    (packageData) => {
      if (!packageData) {
        return;
      }

      fillFormFromPackage(packageData);

      emitPackageParams();
    },
    {
      immediate: true,
    },
  );

  onBeforeRouteLeave((to, from) => {
    if (!props.formKey || to.path === from.path) {
      return;
    }

    if (formStore.getFormData(props.formKey)) {
      formStore.showReturnWarning(props.formKey);
    }
  });
</script>

<template>
  <StandardFormLayout class="package-form-card">
    <div class="package-form-header">
      <DocumentIcon />

      <div>
        <h4>
          {{ $t('package.form_title') }}
        </h4>

        <p>
          {{ $t('package.form_description') }}
        </p>
      </div>
    </div>

    <div class="form-fields" :class="{ disabled: loading }">
      <!-- Title -->
      <div class="field-group field-group--full">
        <MultiLangInput
          field-key="title"
          :label="$t('title')"
          :languages="['ar', 'en']"
          :model-value="titleTranslations"
          type="title"
          @update:model-value="updateTitleTranslations"
        />
      </div>

      <!-- Duration -->
      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="package-duration">
            {{ $t('package.duration') }}
          </label>

          <FieldHelpIcon
            :label="$t('package.duration')"
            field-name="duration"
            field-id="package-duration"
          />
        </span>

        <input
          id="package-duration"
          v-model.number="duration"
          class="field-input workspace-control"
          min="0"
          type="number"
          :placeholder="$t('package.duration_placeholder')"
          @input="emitPackageParams"
        />
      </div>

      <!-- Duration type -->
      <div class="field-group">
        <UpdatedCustomInputSelect
          id="package-duration-type"
          :model-value="selectedDurationType"
          :label="$t('package.duration_type')"
          :placeholder="$t('package.duration_type_placeholder')"
          :static-options="durationTypeOptions"
          :reload="false"
          :disabled="loading"
          required
          @update:model-value="updateDurationType"
        />
      </div>

      <!-- Price -->
      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="package-price">
            {{ $t('package.price') }}
          </label>

          <FieldHelpIcon :label="$t('package.price')" field-name="price" field-id="package-price" />
        </span>

        <input
          id="package-price"
          v-model="price"
          class="field-input workspace-control"
          inputmode="decimal"
          type="text"
          :placeholder="$t('package.price_placeholder')"
          @input="emitPackageParams"
        />
      </div>

      <!-- Discount type -->
      <div class="field-group">
        <UpdatedCustomInputSelect
          id="package-discount-type"
          :model-value="selectedDiscountType"
          :label="$t('package.discount_type')"
          :placeholder="$t('package.discount_type_placeholder')"
          :static-options="discountTypeOptions"
          :reload="false"
          :disabled="loading"
          required
          @update:model-value="updateDiscountType"
        />
      </div>

      <!-- Discount value -->
      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="package-discount-value">
            {{ $t('package.discount_value') }}
          </label>

          <FieldHelpIcon
            :label="$t('package.discount_value')"
            field-name="discount_value"
            field-id="package-discount-value"
          />
        </span>

        <input
          id="package-discount-value"
          v-model.number="discountValue"
          class="field-input workspace-control"
          min="0"
          inputmode="decimal"
          type="number"
          :placeholder="$t('package.discount_value_placeholder')"
          @input="emitPackageParams"
        />
      </div>

      <!-- Project numbers -->
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
          class="field-input workspace-control"
          min="0"
          type="number"
          :placeholder="$t('package.projectnumbers_placeholder')"
          @input="emitPackageParams"
        />
      </div>

      <!-- Employee numbers -->
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
          class="field-input workspace-control"
          min="0"
          type="number"
          :placeholder="$t('package.employeenumbers_placeholder')"
          @input="emitPackageParams"
        />
      </div>

      <!-- Mobile -->
      <label class="toggle-field" for="package-hasmobild">
        <input
          id="package-hasmobild"
          v-model="hasmobild"
          type="checkbox"
          @change="emitPackageParams"
        />

        <span>
          {{ $t('package.hasmobild') }}
        </span>
      </label>

      <!-- Portal -->
      <label class="toggle-field" for="package-hasportal">
        <input
          id="package-hasportal"
          v-model="hasportal"
          type="checkbox"
          @change="emitPackageParams"
        />

        <span>
          {{ $t('package.hasportal') }}
        </span>
      </label>
    </div>
  </StandardFormLayout>
</template>

<style scoped lang="scss">
.package-form-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;

  h4,
  p {
    margin: 0;
  }

  p {
    margin-top: 0.25rem;
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

.field-group {
  min-width: 0;

  &--full {
    grid-column: 1 / -1;
  }
}

.field-input {
  width: 100%;
  min-height: var(--bh-control-height);
  padding: 12px 16px;
  border: 1px solid var(--border-weak);
  border-radius: var(--bh-radius-control);
  outline: none;
  background: var(--bh-surface-raised);
  color: var(--bread-crumb-color-span);
  font-family: 'Medium';
  font-size: var(--sm-size);
  font-weight: 400;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:focus {
    border-color: var(--primary-color);
    box-shadow: none;
  }
}

.toggle-field {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 48px;
  padding: 0 1rem;
  border: 1px solid var(--border-weak);
  border-radius: 28px;
  background: var(--bh-surface-raised);
  cursor: pointer;

  input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
}

@media (max-width: 768px) {
  .form-fields {
    grid-template-columns: 1fr;
  }

  .field-group--full {
    grid-column: auto;
  }
}
</style>
