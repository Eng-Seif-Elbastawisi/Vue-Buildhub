<script lang="ts" setup>
  import MultiSelect from 'primevue/multiselect';

  import Select from 'primevue/select';

  import { computed, ref, watch, toRefs } from 'vue';

  import type Params from '@/base/Core/Params/params';

  import ValidationService from '@/base/Presentation/Utils/validationService';

  import IconBackStage from '@/shared/icons/IconBackStage.vue';

  import PlusIcon from '@/shared/icons/PlusIcon.vue';

  import type TitleInterface from '@/base/Data/Models/titleInterface';

  import type BaseController from '@/base/Presentation/Controller/baseController';

  export type ComponentType = 'select' | 'multiselect';

  interface Props {
    label?: string;

    options?: TitleInterface<string | number>[];

    staticOptions?: TitleInterface<string | number>[] | null;

    modelValue:
      | TitleInterface<string | number>
      | TitleInterface<string | number>[]
      | null
      | undefined;

    placeholder: string;

    controller?: BaseController<any>;

    params?: Params;

    type?: ComponentType | number;

    required?: boolean;

    id?: string;

    autoFill?: boolean;

    reload?: boolean;

    optional?: boolean;

    hascontent?: boolean;

    hasHeader?: boolean;

    onclick?: () => void;
  }

  const emit = defineEmits(['update:modelValue', 'update:slot']);

  const props = withDefaults(defineProps<Props>(), {
    type: 1,

    required: false,

    autoFill: false,

    id: 'custom-select-input',

    reload: true,

    staticOptions: null,

    optional: false,
  });

  const {
    modelValue,

    type,

    controller,

    params,

    staticOptions,

    autoFill,

    id,

    required,

    reload: enableReload,
  } = toRefs(props);

  // Reactive state

  const loading = ref(false);

  const message = ref('No Data Found');

  const localValue = ref(props.modelValue);

  const dynamicOptions = ref<TitleInterface<string | number>[]>([]);

  // Computed properties

  const isMultiselect = computed(() => Number(type.value) === 2);

  const componentType = computed(() => (isMultiselect.value ? MultiSelect : Select));

  const mergedOptions = computed(() => staticOptions?.value ?? dynamicOptions.value);

  const multiselectProps = computed(() =>
    isMultiselect.value ? { display: 'chip', maxSelectedLabels: 6 } : {},
  );

  // Value handling

  const normalizedValue = computed({
    get: () => localValue.value,

    set: (newValue) => {
      localValue.value = isMultiselect.value ? ensureArray(newValue) : ensureSingle(newValue);

      // console.log(localValue.value, 'localValue.value');

      emitUpdate();
    },
  });

  // Watchers

  watch(modelValue, syncLocalValue);

  watch([params, controller], handleOptionUpdates, { immediate: true });

  watch(mergedOptions, () => {
    if (!modelValue.value || Array.isArray(modelValue.value)) {
      syncLocalValue(modelValue.value);
      return;
    }
    const id = (modelValue.value as TitleInterface<string | number>).id;
    const match = mergedOptions.value.find((opt) => opt.id === id);
    if (match && match !== localValue.value) {
      localValue.value = match;
    }
  });

  // Initialization

  syncLocalValue(props.modelValue);

  // Methods

  function ensureArray(value: unknown): TitleInterface<string | number>[] {
    return Array.isArray(value) ? (value as TitleInterface<string | number>[]) : [];
  }

  function ensureSingle(value: unknown): TitleInterface<number | string> | null {
    if (value !== null && typeof value === 'object' && 'id' in value) {
      return value as TitleInterface<number | string>;
    }
    return null;
  }

  function syncLocalValue(newValue: typeof props.modelValue): void {
    if (newValue === localValue.value) return;

    // Handle multiselect (array)

    if (Array.isArray(newValue)) {
      // if (mergedOptions.value.length > 0) {
      localValue.value = newValue.map((item) => {
        const match = mergedOptions.value.find((opt) => opt.id === item.id);
        return match ?? item;
      });
      // } else {
      //   localValue.value = newValue;
      // }
      return;
    }

    // Handle single select
    if (newValue && mergedOptions.value.length > 0) {
      const id = (newValue as TitleInterface<string | number>).id;
      const match = mergedOptions.value.find((opt) => opt.id === id);
      localValue.value = match ?? newValue;
    } else {
      localValue.value = newValue;
    }
  }

  function emitUpdate(): void {
    // console.log(localValue.value, 'localValue.value');

    emit('update:modelValue', localValue.value);

    ValidationService.clearError(id.value);
  }

  async function handleOptionUpdates(): Promise<void> {
    if (params?.value && controller?.value) {
      await fetchOptions();
    } else {
      dynamicOptions.value = staticOptions?.value ?? [];
    }
  }

  async function fetchOptions(): Promise<void> {
    if (!controller?.value || !params?.value) return;

    try {
      loading.value = true;

      message.value = 'Loading Data';

      // Before: const response = await controller.value.fetch(params.value);

      const response = await controller.value.fetchAsOptions(params.value);

      dynamicOptions.value = response;

      updateControllerState();

      handleAutoFill(response);
    } catch (error) {
      handleFetchError(error);
    } finally {
      loading.value = false;
    }
  }

  function updateControllerState(): void {
    if (!controller?.value) return;

    if (controller.value.isListFailed()) {
      message.value = 'An Error Occurred';
    } else if (controller.value.isListSuccess()) {
      message.value = 'No Data Found';
    }
  }

  function handleAutoFill(options: TitleInterface<number | string>[]): void {
    if (autoFill?.value && options.length === 1) {
      normalizedValue.value = isMultiselect.value ? [options[0]!] : options[0]!;
    }
  }

  function handleFetchError(error: unknown): void {
    console.error('Fetch error:', error);

    message.value = 'Failed to load data';

    dynamicOptions.value = [];
  }

  async function reloadData(): Promise<void> {
    if (loading.value) return;

    await fetchOptions();

    normalizedValue.value = isMultiselect.value ? [] : null;
  }
</script>

<template>
  <div class="input-label flex justify-between w-full">
    <slot v-if="!hasHeader">
      <div class="flex items-center">
        <slot name="reloadHeader"></slot>

        <span
          v-if="enableReload"
          class="reload-icon cursor-pointer flex items-center gap-sm me-2 w-full"
          @click="reloadData"
        >
          <span v-if="optional" class="optional-text">({{ $t('optional') }})</span>

          <IconBackStage />
        </span>
      </div>

      <div class="flex items-center gap-2">
        <div v-if="onclick" class="add-dialog" @click="onclick">
          <PlusIcon />
        </div>

        <label :class="{ required: required }" class="input-label">
          <span v-if="required" class="text-red-500">*</span>

          {{ $t(label ?? '') }}
        </label>

        <slot name="LabelHeader"></slot>
      </div>
    </slot>

    <slot v-else name="Header"></slot>
  </div>

  <slot v-if="!hascontent">
    <component
      :is="componentType"
      v-model="normalizedValue"
      :options="mergedOptions"
      :placeholder="placeholder"
      class="input-select w-full"
      option-label="title"
      v-bind="multiselectProps"
      filter
      :loading="loading"
      :empty-message="message"
    />

    <input :id="id" type="text" class="hidden w-full" :value="normalizedValue" />
  </slot>

  <slot v-else name="content"> </slot>
</template>

<style scoped lang="scss">
  .reload-icon {
    z-index: 9999;
    cursor: pointer;
  }
  .add-dialog {
    width: 20px;
    height: 20px;
    margin-right: 6px;
    cursor: pointer;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  .input-select {
    width: 100%;
    background-color: transparent;
    border-radius: 50px;

    &:focus {
      border: 1px solid #d9dbe9 !important;
    }
  }
</style>
