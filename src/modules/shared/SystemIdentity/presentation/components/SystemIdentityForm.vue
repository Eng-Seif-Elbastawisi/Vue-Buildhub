<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { onBeforeRouteLeave } from 'vue-router';
  import { convertToBase64 } from '@/base/Presentation/Utils/convertToBase64';
  import { useFormsStore } from '@/stores/formsStore';
  import type SystemIdentityShowModel from '../../core/models/system.identity.show.model';
  import StoreSystemIdentityParams from '../../core/params/store.system.identity.params';
  import {
    useSystemIdentityTheme,
    type SystemIdentityPalette,
  } from '../composables/useSystemIdentityTheme';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';

  const emit = defineEmits<{ updateData: [params: StoreSystemIdentityParams] }>();
  const props = defineProps<{
    identity?: SystemIdentityShowModel;
    formKey?: string;
    loading?: boolean;
  }>();

  const formStore = useFormsStore();
  const {
    defaultPalette,
    extractedColors,
    detectedPalette,
    extractColorsFromImage,
    applyPalette,
    resetPalette,
  } = useSystemIdentityTheme();

  const name = ref(defaultPalette.name);
  const logo = ref<string | undefined>();
  const logoPreview = ref<string | undefined>();
  const primaryColor = ref(defaultPalette.primary);
  const secondaryColor = ref(defaultPalette.secondary);
  const accentColor = ref(defaultPalette.accent);
  const isActive = ref(true);
  const isExtracting = ref(false);
  const fileInput = ref<HTMLInputElement | null>(null);

  const palette = computed<SystemIdentityPalette>(() => ({
    name: name.value,
    primary: primaryColor.value,
    secondary: secondaryColor.value,
    accent: accentColor.value,
  }));

  const paletteStyle = computed(() => ({
    '--palette-primary': primaryColor.value,
    '--palette-secondary': secondaryColor.value,
    '--palette-accent': accentColor.value,
  }));

  const swatchStyle = (color: string) => ({
    '--swatch-color': color,
  });

  const buildParams = () => {
    emit(
      'updateData',
      new StoreSystemIdentityParams({
        name: name.value,
        logo: logo.value,
        primary_color: primaryColor.value,
        secondary_color: secondaryColor.value,
        accent_color: accentColor.value,
        extracted_colors: extractedColors.value,
        is_active: isActive.value,
      }),
    );
  };

  const setPalette = (nextPalette: SystemIdentityPalette) => {
    name.value = nextPalette.name;
    primaryColor.value = nextPalette.primary;
    secondaryColor.value = nextPalette.secondary;
    accentColor.value = nextPalette.accent;
    buildParams();
  };

  const openFileDialog = () => {
    fileInput.value?.click();
  };

  const handleLogoUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (logoPreview.value && logoPreview.value.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview.value);
    }

    logoPreview.value = URL.createObjectURL(file);
    isExtracting.value = true;

    try {
      const base64Logo = await convertToBase64(file);
      logo.value = Array.isArray(base64Logo) ? base64Logo[0] : base64Logo;
      await extractColorsFromImage(file);
      buildParams();
    } finally {
      isExtracting.value = false;
    }
  };

  const applyDetectedColors = () => {
    setPalette(detectedPalette.value);
    applyPalette(detectedPalette.value);
  };

  const resetDefault = () => {
    setPalette(defaultPalette);
    resetPalette();
  };

  const applyCurrentPalette = () => {
    applyPalette(palette.value);
  };

  onBeforeRouteLeave((to, from) => {
    const savedData = props.formKey ? formStore.getFormData(props.formKey) : null;
    if (savedData && to.path !== from.path && props.formKey) {
      formStore.showReturnWarning(props.formKey);
    }
  });

  watch(
    () => props.identity,
    (identity) => {
      if (!identity) {
        buildParams();
        return;
      }

      name.value = identity.name ?? defaultPalette.name;
      logo.value = undefined;
      logoPreview.value = identity.logo;
      primaryColor.value = identity.primaryColor;
      secondaryColor.value = identity.secondaryColor;
      accentColor.value = identity.accentColor;
      extractedColors.value = [...identity.extractedColors];
      isActive.value = identity.isActive;
      buildParams();
    },
    { immediate: true },
  );
</script>

<template>
  <div class="system-identity-form" :class="{ disabled: props.loading }">
    <header class="form-header">
      <div>
        <h4>{{ $t('system_identity.form_title') }}</h4>
        <p>{{ $t('system_identity.form_description') }}</p>
      </div>
    </header>

    <div class="form-grid">
      <section class="form-card">
        <div class="field-group">
          <span class="field-help-label-row">
            <label for="system-identity-name">{{ $t('system_identity.name') }}</label>
            <FieldHelpIcon
              :label="$t('system_identity.name')"
              field-name="name"
              field-id="system-identity-name"
            />
          </span>
          <input
            id="system-identity-name"
            v-model="name"
            type="text"
            class="field-input"
            @input="buildParams"
          />
        </div>

        <div class="logo-upload">
          <span class="field-help-label-row">
            <span>{{ $t('system_identity.logo') }}</span>
            <FieldHelpIcon :label="$t('system_identity.logo')" field-name="image" />
          </span>
          <div class="logo-preview">
            <img v-if="logoPreview" :src="logoPreview" :alt="$t('system_identity.logo')" />
            <span v-else>{{ $t('system_identity.logo_preview') }}</span>
          </div>
          <input
            ref="fileInput"
            class="file-input"
            type="file"
            accept="image/*"
            @change="handleLogoUpload"
          />
          <button type="button" class="identity-button secondary" @click="openFileDialog">
            {{ $t('system_identity.upload_logo') }}
          </button>
        </div>

        <div class="toggle-row">
          <input
            id="system-identity-active"
            v-model="isActive"
            type="checkbox"
            @change="buildParams"
          />
          <span class="field-help-label-row">
            <label for="system-identity-active">{{ $t('system_identity.active') }}</label>
            <FieldHelpIcon
              :label="$t('system_identity.active')"
              field-name="status"
              field-id="system-identity-active"
            />
          </span>
        </div>
      </section>

      <section class="form-card">
        <div class="color-row">
          <span class="field-help-label-row">
            <label for="system-identity-primary-color">{{
              $t('system_identity.primary_color')
            }}</label>
            <FieldHelpIcon
              :label="$t('system_identity.primary_color')"
              field-name="color"
              field-id="system-identity-primary-color"
            />
          </span>
          <input
            id="system-identity-primary-color"
            v-model="primaryColor"
            type="color"
            @input="buildParams"
          />
          <strong>{{ primaryColor }}</strong>
        </div>

        <div class="color-row">
          <span class="field-help-label-row">
            <label for="system-identity-secondary-color">{{
              $t('system_identity.secondary_color')
            }}</label>
            <FieldHelpIcon
              :label="$t('system_identity.secondary_color')"
              field-name="color"
              field-id="system-identity-secondary-color"
            />
          </span>
          <input
            id="system-identity-secondary-color"
            v-model="secondaryColor"
            type="color"
            @input="buildParams"
          />
          <strong>{{ secondaryColor }}</strong>
        </div>

        <div class="color-row">
          <span class="field-help-label-row">
            <label for="system-identity-accent-color">{{
              $t('system_identity.accent_color')
            }}</label>
            <FieldHelpIcon
              :label="$t('system_identity.accent_color')"
              field-name="color"
              field-id="system-identity-accent-color"
            />
          </span>
          <input
            id="system-identity-accent-color"
            v-model="accentColor"
            type="color"
            @input="buildParams"
          />
          <strong>{{ accentColor }}</strong>
        </div>

        <div class="extracted-colors">
          <span>{{ $t('system_identity.extracted_colors') }}</span>
          <div v-if="extractedColors.length" class="swatch-list">
            <button
              v-for="color in extractedColors"
              :key="color"
              type="button"
              class="color-swatch"
              :style="swatchStyle(color)"
              @click="
                primaryColor = color;
                buildParams();
              "
            >
              <span>{{ color }}</span>
            </button>
          </div>
          <p v-else>{{ isExtracting ? $t('system_identity.extracting_colors') : '-' }}</p>
        </div>

        <div class="button-row">
          <button
            type="button"
            class="identity-button"
            :disabled="extractedColors.length < 3"
            @click="applyDetectedColors"
          >
            {{ $t('system_identity.apply_detected_colors') }}
          </button>
          <button type="button" class="identity-button secondary" @click="resetDefault">
            {{ $t('system_identity.reset_default') }}
          </button>
        </div>
      </section>

      <section class="form-card preview-card" :style="paletteStyle">
        <div class="preview-strip">
          <span class="primary"></span>
          <span class="secondary"></span>
          <span class="accent"></span>
        </div>
        <h5>{{ name }}</h5>
        <p>{{ $t('system_identity.description') }}</p>
        <button type="button" class="identity-button" @click="applyCurrentPalette">
          {{ $t('system_identity.identity_applied') }}
        </button>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .system-identity-form,
  .form-grid,
  .form-card,
  .logo-upload,
  .field-group,
  .extracted-colors {
    display: flex;
    flex-direction: column;
  }

  .system-identity-form {
    gap: 1rem;

    &.disabled {
      pointer-events: none;
      opacity: 0.7;
    }
  }

  .form-header {
    h4,
    p {
      margin: 0;
    }

    p {
      margin-top: 0.35rem;
      color: var(--gray-500);
    }
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .form-card {
    gap: 1rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    padding: 1rem;
    background: var(--BgWhite);
    box-shadow: var(--shadow-sm);
  }

  .field-group,
  .logo-upload,
  .extracted-colors {
    gap: 0.55rem;
    color: var(--gray-700);
    font-weight: 800;
  }

  .field-input {
    width: 100%;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    padding: 0.75rem 1rem;
    background: var(--BgWhite);
    color: var(--gray-800);
  }

  .logo-preview {
    display: grid;
    min-height: 170px;
    place-items: center;
    overflow: hidden;
    border: 1px dashed var(--PrimaryColor-alpha-40);
    border-radius: var(--radius-sm);
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);

    img {
      max-width: 100%;
      max-height: 170px;
      object-fit: contain;
    }
  }

  .file-input {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    opacity: 0;
  }

  .toggle-row,
  .color-row,
  .button-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .color-row {
    justify-content: space-between;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    padding: 0.75rem;
    background: var(--gray-50);

    input {
      width: 48px;
      height: 36px;
      border: 1px solid var(--border-weak);
      border-radius: var(--radius-sm);
      background: var(--BgWhite);
    }

    strong {
      color: var(--gray-600);
      font-family: monospace;
    }
  }

  .swatch-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .color-swatch {
    width: 40px;
    height: 40px;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    background: var(--swatch-color);
    cursor: pointer;

    span {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
    }
  }

  .identity-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 42px;
    border: 1px solid var(--button-primary-bg, var(--PrimaryColor));
    border-radius: var(--radius-sm);
    padding: 0.7rem 1rem;
    background: var(--button-primary-bg, var(--PrimaryColor));
    color: var(--button-primary-color, var(--BgWhite));
    font-weight: 800;
    cursor: pointer;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    &.secondary {
      background: var(--BgWhite);
      color: var(--PrimaryColor);
    }
  }

  .preview-card {
    grid-column: 1 / -1;
  }

  .preview-strip {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    overflow: hidden;
    height: 56px;
    border-radius: var(--radius-sm);

    .primary {
      background: var(--palette-primary);
    }

    .secondary {
      background: var(--palette-secondary);
    }

    .accent {
      background: var(--palette-accent);
    }
  }

  @media (max-width: 900px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
