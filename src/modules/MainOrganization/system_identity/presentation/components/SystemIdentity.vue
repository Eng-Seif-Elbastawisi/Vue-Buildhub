<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { useSystemIdentity, type SystemPalette } from '@/composables/useSystemIdentity';

  type PaletteColorKey = keyof Pick<SystemPalette, 'primary' | 'secondary' | 'accent'>;

  const {
    currentPalette,
    defaultPalette,
    suggestedPalettes,
    extractedColors,
    detectedPalette,
    applyPalette,
    resetPalette,
    loadSavedPalette,
    extractColorsFromImage,
  } = useSystemIdentity();

  const fileInput = ref<HTMLInputElement | null>(null);
  const logoPreview = ref<string | null>(null);
  const editablePalette = ref<SystemPalette>({ ...currentPalette.value });
  const statusKey = ref('');
  const isExtracting = ref(false);

  const colorFields: Array<{ key: PaletteColorKey; labelKey: string }> = [
    { key: 'primary', labelKey: 'system_identity.primary' },
    { key: 'secondary', labelKey: 'system_identity.secondary' },
    { key: 'accent', labelKey: 'system_identity.accent' },
  ];

  const canApplyLogoPalette = computed(() => extractedColors.value.length >= 3);

  const swatchStyle = (color: string) => ({
    '--swatch-color': color,
  });

  const paletteStyle = (palette: SystemPalette) => ({
    '--palette-primary': palette.primary,
    '--palette-secondary': palette.secondary,
    '--palette-accent': palette.accent,
  });

  const updateColor = (key: PaletteColorKey, color: string) => {
    editablePalette.value = {
      ...editablePalette.value,
      [key]: color,
      name: 'Custom Identity',
    };
  };

  const handleColorInput = (key: PaletteColorKey, event: Event) => {
    updateColor(key, (event.target as HTMLInputElement).value);
  };

  const applyCurrentIdentity = () => {
    applyPalette(editablePalette.value);
    statusKey.value = 'system_identity.identity_applied';
  };

  const applySuggestedPalette = (palette: SystemPalette) => {
    editablePalette.value = { ...palette };
    applyPalette(palette);
    statusKey.value = 'system_identity.identity_applied';
  };

  const applyLogoIdentity = () => {
    if (!canApplyLogoPalette.value) return;

    editablePalette.value = { ...detectedPalette.value };
    applyPalette(detectedPalette.value);
    statusKey.value = 'system_identity.identity_applied';
  };

  const handleReset = () => {
    resetPalette();
    editablePalette.value = { ...defaultPalette };
    statusKey.value = 'system_identity.identity_reset';
  };

  const selectExtractedColor = (color: string) => {
    updateColor('primary', color);
  };

  const openFileDialog = () => {
    fileInput.value?.click();
  };

  const handleLogoUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      statusKey.value = 'system_identity.logo_required';
      return;
    }

    if (logoPreview.value) URL.revokeObjectURL(logoPreview.value);

    logoPreview.value = URL.createObjectURL(file);
    isExtracting.value = true;
    statusKey.value = '';

    try {
      await extractColorsFromImage(file);
      editablePalette.value = { ...detectedPalette.value };
    } finally {
      isExtracting.value = false;
    }
  };

  watch(
    currentPalette,
    (palette) => {
      editablePalette.value = { ...palette };
    },
    { deep: true },
  );

  onMounted(() => {
    editablePalette.value = { ...loadSavedPalette() };
  });
</script>

<template>
  <main class="system-identity-page">
    <header class="system-identity-header">
      <div>
        <p class="eyebrow">{{ $t('system_identity.page_label') }}</p>
        <h1>{{ $t('system_identity.title') }}</h1>
        <p>{{ $t('system_identity.description') }}</p>
      </div>

      <button
        type="button"
        class="identity-button secondary"
        data-testid="reset-identity"
        @click="handleReset"
      >
        {{ $t('system_identity.reset_identity') }}
      </button>
    </header>

    <p v-if="statusKey" class="identity-status" role="status">
      {{ $t(statusKey) }}
    </p>

    <section class="identity-grid">
      <article class="identity-card logo-card">
        <div class="card-heading">
          <h2>{{ $t('system_identity.logo_and_colors') }}</h2>
          <p>{{ $t('system_identity.logo_and_colors_description') }}</p>
        </div>

        <div class="logo-preview" :class="{ empty: !logoPreview }">
          <img v-if="logoPreview" :src="logoPreview" :alt="$t('system_identity.logo_preview')" />
          <span v-else>{{ $t('system_identity.logo_preview') }}</span>
        </div>

        <input
          ref="fileInput"
          class="file-input"
          type="file"
          accept="image/*"
          @change="handleLogoUpload"
        />

        <button type="button" class="identity-button" @click="openFileDialog">
          {{ $t('system_identity.upload_logo') }}
        </button>

        <div class="detected-colors">
          <span>{{ $t('system_identity.detected_from_logo') }}</span>

          <div v-if="extractedColors.length" class="swatch-list">
            <button
              v-for="color in extractedColors"
              :key="color"
              type="button"
              class="color-swatch"
              :style="swatchStyle(color)"
              :aria-label="$t('system_identity.use_detected_color', { color })"
              @click="selectExtractedColor(color)"
            >
              <span>{{ color }}</span>
            </button>
          </div>

          <p v-else class="muted">
            {{
              isExtracting
                ? $t('system_identity.extracting_colors')
                : $t('system_identity.no_detected_colors')
            }}
          </p>
        </div>

        <button
          type="button"
          class="identity-button full"
          :disabled="!canApplyLogoPalette"
          @click="applyLogoIdentity"
        >
          {{ $t('system_identity.apply_logo_identity') }}
        </button>
      </article>

      <article class="identity-card">
        <div class="card-heading">
          <h2>{{ $t('system_identity.current_colors') }}</h2>
          <p>{{ $t('system_identity.current_colors_description') }}</p>
        </div>

        <div class="current-colors">
          <label v-for="field in colorFields" :key="field.key" class="color-row">
            <span class="color-label">{{ $t(field.labelKey) }}</span>
            <span class="color-sample" :style="swatchStyle(editablePalette[field.key])"></span>
            <span class="hex-value">{{ editablePalette[field.key] }}</span>
            <input
              v-model="editablePalette[field.key]"
              type="color"
              :data-testid="`color-input-${field.key}`"
              :aria-label="$t(field.labelKey)"
              @input="handleColorInput(field.key, $event)"
            />
          </label>
        </div>

        <button
          type="button"
          class="identity-button full"
          data-testid="apply-current-identity"
          @click="applyCurrentIdentity"
        >
          {{ $t('system_identity.apply_current_identity') }}
        </button>
      </article>
    </section>

    <section class="identity-card suggested-card">
      <div class="card-heading">
        <h2>{{ $t('system_identity.suggested_palettes') }}</h2>
        <p>{{ $t('system_identity.suggested_palettes_description') }}</p>
      </div>

      <div class="palette-grid">
        <article
          v-for="palette in suggestedPalettes"
          :key="palette.name"
          class="palette-card"
          :style="paletteStyle(palette)"
        >
          <div class="palette-strip" aria-hidden="true">
            <span class="primary"></span>
            <span class="secondary"></span>
            <span class="accent"></span>
          </div>

          <h3>{{ palette.name }}</h3>

          <div class="palette-values">
            <span>{{ palette.primary }}</span>
            <span>{{ palette.secondary }}</span>
            <span>{{ palette.accent }}</span>
          </div>

          <button
            type="button"
            class="identity-button secondary"
            @click="applySuggestedPalette(palette)"
          >
            {{ $t('system_identity.apply_palette') }}
          </button>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss">
  .system-identity-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    color: var(--gray-800);
  }

  .system-identity-header,
  .identity-card,
  .palette-card {
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    background: var(--BgWhite);
    box-shadow: var(--shadow-sm);
  }

  .system-identity-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.25rem;

    h1 {
      margin: 0.2rem 0;
      color: var(--gray-900);
      font-size: 1.75rem;
      font-weight: 800;
    }

    p {
      margin: 0;
      color: var(--gray-500);
    }
  }

  .eyebrow {
    color: var(--PrimaryColor) !important;
    font-size: 0.78rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  .identity-status {
    margin: 0;
    border: 1px solid var(--PrimaryColor-alpha-20);
    border-radius: var(--radius-sm);
    padding: 0.85rem 1rem;
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
    font-weight: 700;
  }

  .identity-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .identity-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem;
  }

  .card-heading {
    h2 {
      margin: 0;
      color: var(--gray-900);
      font-size: 1.05rem;
      font-weight: 800;
    }

    p {
      margin: 0.35rem 0 0;
      color: var(--gray-500);
      line-height: 1.6;
    }
  }

  .logo-preview {
    display: grid;
    min-height: 190px;
    place-items: center;
    overflow: hidden;
    border: 1px dashed var(--PrimaryColor-alpha-40);
    border-radius: var(--radius-sm);
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
    font-weight: 800;

    img {
      max-width: 100%;
      max-height: 190px;
      object-fit: contain;
    }
  }

  .file-input {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    opacity: 0;
    pointer-events: none;
  }

  .identity-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 42px;
    border: 1px solid var(--button-primary-bg, var(--PrimaryColor));
    border-radius: var(--radius-sm);
    padding: 0.75rem 1rem;
    background: var(--button-primary-bg, var(--PrimaryColor));
    color: var(--button-primary-color, var(--BgWhite));
    font-weight: 800;
    cursor: pointer;
    transition:
      transform var(--transition-fast),
      opacity var(--transition-fast);

    &:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    &.secondary {
      background: var(--BgWhite);
      color: var(--PrimaryColor);
    }

    &.full {
      width: 100%;
    }
  }

  .detected-colors {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    color: var(--gray-700);
    font-weight: 700;
  }

  .swatch-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
  }

  .color-swatch,
  .color-sample {
    background: var(--swatch-color);
  }

  .color-swatch {
    width: 42px;
    height: 42px;
    overflow: hidden;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    padding: 0;
    cursor: pointer;

    span {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
    }
  }

  .muted {
    margin: 0;
    color: var(--gray-500);
    font-weight: 500;
  }

  .current-colors {
    display: grid;
    gap: 0.8rem;
  }

  .color-row {
    display: grid;
    grid-template-columns: minmax(90px, 1fr) 42px minmax(80px, auto) 52px;
    align-items: center;
    gap: 0.75rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    padding: 0.75rem;
    background: var(--gray-50);
  }

  .color-label {
    color: var(--gray-700);
    font-weight: 800;
  }

  .color-sample {
    width: 42px;
    height: 42px;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
  }

  .hex-value {
    color: var(--gray-600);
    font-family: monospace;
    font-size: 0.88rem;
  }

  input[type='color'] {
    width: 52px;
    height: 38px;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    padding: 0.2rem;
    background: var(--BgWhite);
    cursor: pointer;
  }

  .palette-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
  }

  .palette-card {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    padding: 1rem;

    h3 {
      margin: 0;
      color: var(--gray-900);
      font-size: 1rem;
    }
  }

  .palette-strip {
    display: grid;
    grid-template-columns: 1.1fr 0.8fr 0.8fr;
    overflow: hidden;
    height: 46px;
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

  .palette-values {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;

    span {
      border-radius: var(--radius-xs);
      padding: 0.35rem 0.45rem;
      background: var(--gray-50);
      color: var(--gray-600);
      font-family: monospace;
      font-size: 0.78rem;
    }
  }

  @media (max-width: 900px) {
    .system-identity-header,
    .identity-grid {
      grid-template-columns: 1fr;
    }

    .system-identity-header {
      align-items: stretch;
      flex-direction: column;
    }
  }

  @media (max-width: 560px) {
    .system-identity-page {
      padding: 1rem;
    }

    .color-row {
      grid-template-columns: 1fr 42px;
    }

    .hex-value,
    input[type='color'] {
      grid-column: span 2;
    }
  }
</style>
