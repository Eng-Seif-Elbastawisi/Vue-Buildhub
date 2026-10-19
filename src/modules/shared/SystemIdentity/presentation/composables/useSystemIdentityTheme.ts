import { computed, ref } from 'vue';

export interface SystemIdentityPalette {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  logo?: string | null;
}

export interface SystemIdentitySetting {
  id?: number;
  name?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  accent_color?: string | null;
  third_color?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  logo?: string | null;
  organization?: SystemIdentityContact | null;
  employee?: SystemIdentityContact | null;
  created_at?: string | null;
}

export interface SystemIdentityContact {
  id?: number;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

interface ApplyPaletteOptions {
  persist?: boolean;
}

interface ColorBucket {
  color: string;
  count: number;
}

const STORAGE_KEY = 'systemIdentityPalette';
const MAX_EXTRACTED_COLORS = 8;

const defaultPalette: SystemIdentityPalette = {
  name: 'BuildHub Workspace',
  primary: '#10141A',
  secondary: '#354052',
  accent: '#83A2DB',
};

const suggestedPalettes: SystemIdentityPalette[] = [
  defaultPalette,
  {
    name: 'Executive Slate',
    primary: '#2563EB',
    secondary: '#111827',
    accent: '#14B8A6',
  },
  {
    name: 'Emerald Works',
    primary: '#0F766E',
    secondary: '#172554',
    accent: '#F59E0B',
  },
  {
    name: 'Civic Indigo',
    primary: '#4F46E5',
    secondary: '#0F172A',
    accent: '#06B6D4',
  },
];

const currentPalette = ref<SystemIdentityPalette>({ ...defaultPalette });
const extractedColors = ref<string[]>([]);

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

const normalizeHex = (color: string) => {
  const value = color.trim();

  if (/^#[0-9a-f]{6}$/i.test(value)) return value.toUpperCase();

  if (/^#[0-9a-f]{3}$/i.test(value)) {
    const red = value.charAt(1);
    const green = value.charAt(2);
    const blue = value.charAt(3);

    return `#${red}${red}${green}${green}${blue}${blue}`.toUpperCase();
  }

  return defaultPalette.primary;
};

const hexToRgb = (color: string) => {
  const value = Number.parseInt(normalizeHex(color).replace('#', ''), 16);

  return {
    red: (value >> 16) & 255,
    green: (value >> 8) & 255,
    blue: value & 255,
  };
};

const toRgba = (color: string, alpha: number) => {
  const { red, green, blue } = hexToRgb(color);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const getLuma = (red: number, green: number, blue: number) => {
  return (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
};

const getSaturation = (red: number, green: number, blue: number) => {
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);

  return max === 0 ? 0 : (max - min) / max;
};

const getReadableTextColor = (background: string) => {
  const { red, green, blue } = hexToRgb(background);

  return getLuma(red, green, blue) > 0.58 ? '#101418' : '#FFFFFF';
};

const getColorDistance = (first: string, second: string) => {
  const firstRgb = hexToRgb(first);
  const secondRgb = hexToRgb(second);

  return Math.sqrt(
    (firstRgb.red - secondRgb.red) ** 2 +
      (firstRgb.green - secondRgb.green) ** 2 +
      (firstRgb.blue - secondRgb.blue) ** 2,
  );
};

const bucketColor = (red: number, green: number, blue: number) => {
  const bucketSize = 24;
  const toHex = (value: number) => Math.min(255, value).toString(16).padStart(2, '0');

  return `#${toHex(Math.round(red / bucketSize) * bucketSize)}${toHex(
    Math.round(green / bucketSize) * bucketSize,
  )}${toHex(Math.round(blue / bucketSize) * bucketSize)}`.toUpperCase();
};

const sanitizePalette = (palette: SystemIdentityPalette): SystemIdentityPalette => ({
  name: palette.name || defaultPalette.name,
  primary: normalizeHex(palette.primary),
  secondary: normalizeHex(palette.secondary),
  accent: normalizeHex(palette.accent),
  logo: palette.logo || undefined,
});

const savePalette = (palette: SystemIdentityPalette) => {
  if (!isBrowser()) return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizePalette(palette)));
};

const setCssVariables = (palette: SystemIdentityPalette) => {
  if (!isBrowser()) return;

  const normalized = sanitizePalette(palette);
  const root = document.documentElement;
  const primaryText = getReadableTextColor(normalized.primary);
  const variables: Record<string, string> = {
    '--brand-primary': normalized.primary,
    '--brand-secondary': normalized.secondary,
    '--brand-accent': normalized.accent,
    '--brand-soft': toRgba(normalized.primary, 0.12),
    '--primary-color': normalized.primary,
    '--secondary-color': normalized.secondary,
    '--accent-color': normalized.accent,
    '--sidebar-active-bg': normalized.primary,
    '--sidebar-active-color': primaryText,
    '--button-primary-bg': normalized.primary,
    '--button-primary-color': primaryText,
    '--secondary-text-color': getReadableTextColor(normalized.secondary),
    '--PrimaryColor': normalized.primary,
    '--PrimaryColor-hover': normalized.secondary,
    '--PrimaryColor-active': normalized.accent,
    '--PrimaryColor-dark': normalized.secondary,
    '--PrimaryColor-light': toRgba(normalized.primary, 0.12),
    '--PrimaryColor-alpha-4': toRgba(normalized.primary, 0.04),
    '--PrimaryColor-alpha-8': toRgba(normalized.primary, 0.08),
    '--PrimaryColor-alpha-10': toRgba(normalized.primary, 0.1),
    '--PrimaryColor-alpha-12': toRgba(normalized.primary, 0.12),
    '--PrimaryColor-alpha-15': toRgba(normalized.primary, 0.15),
    '--PrimaryColor-alpha-20': toRgba(normalized.primary, 0.2),
    '--PrimaryColor-alpha-30': toRgba(normalized.primary, 0.3),
    '--PrimaryColor-alpha-40': toRgba(normalized.primary, 0.4),
    '--PrimaryColor-alpha-50': toRgba(normalized.primary, 0.5),
    '--PrimaryColor-alpha-60': toRgba(normalized.primary, 0.6),
    '--PrimaryColor-alpha-75': toRgba(normalized.primary, 0.75),
    '--PrimaryColor-alpha-80': toRgba(normalized.primary, 0.8),
    '--SecondaryColor': normalized.secondary,
    '--primary-green': normalized.primary,
    '--breadcrump-bg': `linear-gradient(to right, ${normalized.primary}, ${normalized.secondary})`,
  };

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};

const applyPalette = (
  palette: SystemIdentityPalette,
  { persist = true }: ApplyPaletteOptions = {},
) => {
  const normalized = sanitizePalette(palette);

  currentPalette.value = normalized;
  setCssVariables(normalized);

  if (persist) {
    savePalette(normalized);
  }
};

const resetPalette = () => {
  applyPalette(defaultPalette);
};

const clearSavedPalette = () => {
  currentPalette.value = { ...defaultPalette };
  setCssVariables(defaultPalette);

  if (!isBrowser()) return;

  window.localStorage.removeItem(STORAGE_KEY);
};

const applySettingTheme = (
  setting?: SystemIdentitySetting | null,
  options?: ApplyPaletteOptions,
) => {
  if (!setting?.primary_color || !setting.secondary_color) return;

  applyPalette(
    {
      name: setting.name ?? defaultPalette.name,
      primary: setting.primary_color,
      secondary: setting.secondary_color,
      accent: setting.accent_color ?? setting.third_color ?? defaultPalette.accent,
      logo: setting.logo,
    },
    options,
  );
};

const loadSavedPalette = () => {
  if (!isBrowser()) {
    setCssVariables(currentPalette.value);
    return currentPalette.value;
  }

  const savedPalette = window.localStorage.getItem(STORAGE_KEY);

  if (!savedPalette) {
    setCssVariables(currentPalette.value);
    return currentPalette.value;
  }

  try {
    const parsedPalette = sanitizePalette(JSON.parse(savedPalette) as SystemIdentityPalette);
    currentPalette.value = parsedPalette;
    setCssVariables(parsedPalette);
    return parsedPalette;
  } catch {
    resetPalette();
    return defaultPalette;
  }
};

const pickPaletteFromExtractedColors = (colors: string[]): SystemIdentityPalette => {
  const rankedColors = colors.map((color) => {
    const { red, green, blue } = hexToRgb(color);

    return {
      color,
      luma: getLuma(red, green, blue),
      saturation: getSaturation(red, green, blue),
    };
  });
  const primary = [...rankedColors]
    .sort((first, second) => second.saturation + second.luma - (first.saturation + first.luma))
    .find((color) => color.luma > 0.22 && color.luma < 0.78)?.color;
  const secondary = [...rankedColors].sort((first, second) => first.luma - second.luma)[0]?.color;
  const accent = [...rankedColors].sort((first, second) => second.luma - first.luma)[0]?.color;

  return sanitizePalette({
    name: 'Detected From Logo',
    primary: primary ?? colors[0] ?? defaultPalette.primary,
    secondary: secondary ?? defaultPalette.secondary,
    accent: accent ?? colors[1] ?? defaultPalette.accent,
  });
};

const extractColorsFromImage = async (file: File) => {
  if (!isBrowser()) return [];

  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();

      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('Unable to read image colors'));
      element.src = imageUrl;
    });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const maxSize = 96;
    const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);

    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));

    if (!context) return [];

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const buckets = new Map<string, ColorBucket>();

    for (let index = 0; index < imageData.length; index += 4) {
      const red = imageData[index] ?? 0;
      const green = imageData[index + 1] ?? 0;
      const blue = imageData[index + 2] ?? 0;
      const alpha = imageData[index + 3] ?? 0;
      const luma = getLuma(red, green, blue);
      const saturation = getSaturation(red, green, blue);

      if (alpha < 128 || luma > 0.92 || (luma > 0.85 && saturation < 0.18)) continue;

      const color = bucketColor(red, green, blue);
      const bucket = buckets.get(color);

      if (bucket) {
        bucket.count += 1;
      } else {
        buckets.set(color, { color, count: 1 });
      }
    }

    const colors = [...buckets.values()]
      .sort((first, second) => second.count - first.count)
      .reduce<string[]>((uniqueColors, bucket) => {
        if (
          uniqueColors.length < MAX_EXTRACTED_COLORS &&
          !uniqueColors.some((color) => getColorDistance(color, bucket.color) < 44)
        ) {
          uniqueColors.push(bucket.color);
        }

        return uniqueColors;
      }, []);

    extractedColors.value = colors;

    return colors;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};

export const useSystemIdentityTheme = () => {
  const detectedPalette = computed(() => pickPaletteFromExtractedColors(extractedColors.value));

  return {
    currentPalette,
    defaultPalette,
    suggestedPalettes,
    extractedColors,
    detectedPalette,
    applyPalette,
    resetPalette,
    clearSavedPalette,
    applySettingTheme,
    loadSavedPalette,
    savePalette,
    extractColorsFromImage,
    setCssVariables,
  };
};
