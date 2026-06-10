<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import Editor from 'primevue/editor';

  const props = withDefaults(
    defineProps<{
      langs: { title: string; locale: string; icon?: any }[];
      modelValue?: {
        locale: string;
        title?: string;
        subtitle?: string;
        description?: string;
        button_title?: string;
        answer?: string;
        question?: string;
        feature?: string;
        old?: string;
        new?: string;
      }[];
      defaultLang?: {
        locale: string;
        title?: string;
        subtitle?: string;
        description?: string;
        button_title?: string;
        answer?: string;
        question?: string;
        feature?: string;
        old?: string;
        new?: string;
      };
      label?: string;
      type?: 'text' | 'textarea' | 'email' | 'password' | 'number' | 'url';
      placeholder?: string;
      rows?: number;
      maxlength?: number;
      required?: boolean;
      disabled?: boolean;
      fieldType?:
        | 'title'
        | 'subtitle'
        | 'description'
        | 'button_title'
        | 'answer'
        | 'question'
        | 'old'
        | 'new'
        | 'feature';
    }>(),
    {
      langs: () => [],
      modelValue: () => [],
      defaultLang: () => ({ locale: 'en' }),
      label: 'Title',
      type: 'text',
      placeholder: '',
      rows: 4,
      maxlength: undefined,
      required: true,
      disabled: false,
      fieldType: 'title',
    },
  );

  const emit = defineEmits<{
    (
      e: 'update:modelValue',
      value: {
        locale: string;
        title?: string;
        subtitle?: string;
        description?: string;
        button_title?: string;
        answer?: string;
        question?: string;
        feature?: string;
        old?: string;
        new?: string;
      }[],
    ): void;
    (e: 'validate', isValid: boolean): void;
  }>();

  // Build titles for all langs with support for multiple field types
  const titles = ref<
    {
      locale: string;
      title?: string;
      subtitle?: string;
      description?: string;
      button_title?: string;
      answer?: string;
      question?: string;
      feature?: string;
      old?: string;
      new?: string;
    }[]
  >(
    props.langs.map((l) => {
      const fromModel = props.modelValue?.find((f) => f.locale === l.locale);
      if (fromModel) return { ...fromModel };
      if (props.defaultLang?.locale === l.locale) {
        return {
          locale: l.locale,
          title: props.defaultLang.title,
          subtitle: props.defaultLang.subtitle,
          description: props.defaultLang.description,
          button_title: props.defaultLang.button_title,
          answer: props.defaultLang.answer,
          question: props.defaultLang.question,
          feature: props.defaultLang.feature,
          old: props.defaultLang.old,
          new: props.defaultLang.new,
        };
      }
      return { locale: l.locale };
    }),
  );

  // Get the current field value based on fieldType
  const getFieldValue = (item: any) => {
    switch (props.fieldType) {
      case 'subtitle':
        return item.subtitle;
      case 'description':
        return item.description;
      case 'button_title':
        return item.button_title;
      case 'answer':
        return item.answer;
      case 'question':
        return item.question;
      case 'old':
        return item.old;
      case 'new':
        return item.new;
      case 'feature':
        return item.feature;
      default:
        return item.title;
    }
  };

  // Set the current field value based on fieldType
  const setFieldValue = (item: any, value: string) => {
    switch (props.fieldType) {
      case 'subtitle':
        item.subtitle = value;
        break;
      case 'description':
        item.description = value;
        break;
      case 'button_title':
        item.button_title = value;
        break;
      case 'answer':
        item.answer = value;
        break;
      case 'question':
        item.question = value;
        break;
      case 'old':
        item.old = value;
        break;
      case 'new':
        item.new = value;
        break;
      case 'feature':
        item.feature = value;
        break;
      default:
        item.title = value;
        break;
    }
  };

  // Get initial active language - FIXED to handle all field types
  const getInitialActiveLang = () => {
    // First, try to find the first language that has content for the current field type
    const langWithContent = titles.value.find((t) => {
      const value = getFieldValue(t);
      return value && value.trim().length > 0;
    });
    if (langWithContent) return langWithContent.locale;

    // If no content, try to use the default language if it exists in langs
    if (props.defaultLang && props.langs.some((l) => l.locale === props.defaultLang?.locale)) {
      return props.defaultLang.locale;
    }

    // Otherwise, use the first available language
    return props.langs[0]?.locale || '';
  };

  // Active language - initialized properly
  const lang = ref(getInitialActiveLang());

  // Current field value binding
  const fieldValue = ref('');

  // Validation error
  const validationError = ref('');

  const isTextarea = computed(() => props.type === 'textarea');

  // Check if at least one language has content for the current field type
  const hasAtLeastOneValue = computed(() => {
    return titles.value.some((t) => {
      const value = getFieldValue(t);
      return value && value.trim().length > 0;
    });
  });

  // Validate and emit validation status
  const validateTitles = () => {
    if (props.required && !hasAtLeastOneValue.value) {
      validationError.value = `At least one language ${props.fieldType} is required`;
      emit('validate', false);
      return false;
    }
    validationError.value = '';
    emit('validate', true);
    return true;
  };

  // Expose validate method for parent component
  defineExpose({
    validate: validateTitles,
    isValid: hasAtLeastOneValue,
  });

  // Sync active field value when lang changes
  watch(
    lang,
    (newLang) => {
      const found = titles.value.find((t) => t.locale === newLang);
      fieldValue.value = found ? getFieldValue(found) || '' : '';
    },
    { immediate: true },
  );

  // Update titles when input changes
  watch(fieldValue, (val) => {
    const idx = titles.value.findIndex((t) => t.locale === lang.value);
    if (idx !== -1) {
      setFieldValue(titles.value[idx], val);
    }
    emit('update:modelValue', [...titles.value]);

    // Clear validation error when user starts typing
    if (val && val.trim().length > 0) {
      validationError.value = '';
    }
  });

  const placeholderText = computed(() => {
    return props.placeholder || props.label || `Enter ${props.fieldType}...`;
  });

  const inputAttrs = computed(() => ({
    placeholder: placeholderText.value,
    maxlength: props.maxlength,
    disabled: props.disabled,
    class: isTextarea.value ? 'textarea-input' : 'text-input',
  }));

  // Sync with parent changes
  watch(
    () => props.modelValue,
    (nv) => {
      if (nv) {
        titles.value = props.langs.map((l) => {
          const fromModel = nv.find((f) => f.locale === l.locale);
          return fromModel ? { ...fromModel } : { locale: l.locale };
        });

        // Only update the current field value if the selected lang's content changed
        const current = titles.value.find((t) => t.locale === lang.value);
        if (current) {
          fieldValue.value = getFieldValue(current) || '';
        }

        // Don't change lang selection here to preserve user choice
        // Only set initial lang if it's empty
        if (!lang.value && props.langs.length > 0) {
          lang.value = getInitialActiveLang();
        }
      }
    },
    { deep: true, immediate: true },
  );

  // Watch for validation changes
  watch(hasAtLeastOneValue, (isValid) => {
    emit('validate', isValid);
  });
</script>

<template>
  <div class="input-wrapper">
    <div class="label-wrapper">
      <label>
        {{ $t(label) }}
        <span v-if="required" class="text-red-500">*</span>
      </label>

      <!-- Dynamic Languages -->
      <div class="languages">
        <div v-for="(l, index) in langs" :key="index" class="input-lang">
          <input
            :id="`${label}-${l.locale}`"
            v-model="lang"
            type="radio"
            :name="label"
            :value="l.locale"
            :required="props.required"
          />
          <label class="icon-lng" :for="`${label}-${l.locale}`">
            <component :is="l.icon" />
            <!-- Visual indicator if this language has content for the current field type -->
            <span
              v-if="getFieldValue(titles.find((t) => t.locale === l.locale))"
              class="lang-indicator"
              :title="`${l.locale.toUpperCase()} has content`"
            >
              ✓
            </span>
          </label>
        </div>
      </div>
    </div>

    <!-- Title Input -->
    <Editor
      v-if="isTextarea"
      v-model="fieldValue"
      :rows="rows"
      v-bind="inputAttrs"
      editor-style="height: 320px"
    />

    <!-- Regular Input -->
    <input
      v-else
      v-model="fieldValue"
      class="lang-input"
      :type="type"
      v-bind="inputAttrs"
      :required="props.required"
    />

    <!-- Selected Language Info -->
    <span class="select-lang">
      {{ lang ? lang.toUpperCase() : 'select language from the top' }}
    </span>

    <!-- Validation Error -->
    <div v-if="validationError" class="validation-error">
      {{ validationError }}
    </div>
  </div>
</template>

<style scoped>
  html[lang='ar'] .lang-input {
    text-align: end !important;
  }

  .lang-indicator {
    position: absolute;
    top: -2px;
    right: -2px;
    background: var(--success);
    color: white;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: bold;
  }

  .icon-lng {
    position: relative;
    display: inline-block;
  }

  .validation-error {
    color: var(--danger);
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
</style>
