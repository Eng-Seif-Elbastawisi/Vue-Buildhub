import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const identityColors = {
  primary: {
    color: 'var(--PrimaryColor)',
    contrastColor: 'var(--button-primary-color)',
    hoverColor: 'var(--SecondaryColor)',
    activeColor: 'var(--SecondaryColor)',
  },
  text: {
    color: 'var(--bh-text)',
    hoverColor: 'var(--bh-text)',
    mutedColor: 'var(--bh-muted)',
    hoverMutedColor: 'var(--bh-text)',
  },
  formField: {
    background: 'var(--bh-surface-raised)',
    disabledBackground: 'var(--bh-surface-secondary)',
    filledBackground: 'var(--bh-surface)',
    filledHoverBackground: 'var(--bh-hover)',
    filledFocusBackground: 'var(--bh-surface-raised)',
    borderColor: 'var(--bh-field-line)',
    hoverBorderColor: 'var(--bh-blue-ink)',
    focusBorderColor: 'var(--bh-focus)',
    invalidBorderColor: 'var(--bh-coral-ink)',
    color: 'var(--bh-text)',
    disabledColor: 'var(--bh-muted)',
    placeholderColor: 'var(--bh-muted)',
    shadow: 'none',
  },
  content: {
    background: 'var(--bh-surface)',
    hoverBackground: 'var(--bh-hover)',
    borderColor: 'var(--bh-line)',
    color: 'var(--bh-text)',
    hoverColor: 'var(--bh-text)',
  },
  overlay: {
    select: {
      background: 'var(--bh-surface-raised)',
      borderColor: 'var(--bh-line)',
      color: 'var(--bh-text)',
    },
    popover: {
      background: 'var(--bh-surface-raised)',
      borderColor: 'var(--bh-line)',
      color: 'var(--bh-text)',
    },
    modal: {
      background: 'var(--bh-surface-raised)',
      borderColor: 'var(--bh-line)',
      color: 'var(--bh-text)',
    },
  },
  highlight: {
    background: 'var(--PrimaryColor-alpha-12)',
    focusBackground: 'var(--PrimaryColor-alpha-20)',
    color: 'var(--PrimaryColor)',
    focusColor: 'var(--PrimaryColor)',
  },
};

const identityButtonColors = {
  root: {
    primary: {
      hoverColor: 'var(--secondary-text-color)',
      activeColor: 'var(--secondary-text-color)',
    },
  },
};

const selectionColors = {
  checkedBackground: 'var(--bh-active)',
  checkedHoverBackground: 'var(--bh-text)',
  checkedBorderColor: 'var(--bh-active)',
  checkedHoverBorderColor: 'var(--bh-text)',
  checkedFocusBorderColor: 'var(--bh-focus)',
};

const switchColors = {
  root: {
    background: 'var(--bh-field-line)',
    hoverBackground: 'var(--bh-muted)',
    checkedBackground: 'var(--bh-active)',
    checkedHoverBackground: 'var(--bh-text)',
  },
  handle: {
    background: 'var(--bh-surface-raised)',
    hoverBackground: 'var(--bh-surface-raised)',
    checkedBackground: 'var(--bh-on-active)',
    checkedHoverBackground: 'var(--bh-on-active)',
  },
};

export default definePreset(Aura, {
  semantic: {
    transitionDuration: 'var(--bh-motion-fast)',
    focusRing: {
      width: '2px',
      style: 'solid',
      color: 'var(--bh-focus)',
      offset: '3px',
      shadow: 'none',
    },
    formField: {
      borderRadius: 'var(--bh-radius-control)',
      paddingX: '0.875rem',
      paddingY: '0.7rem',
    },
    overlay: {
      select: { borderRadius: 'var(--bh-radius-card)', shadow: 'var(--bh-shadow-popover)' },
      popover: { borderRadius: 'var(--bh-radius-card)', shadow: 'var(--bh-shadow-popover)' },
      modal: { borderRadius: 'var(--bh-radius-card)', shadow: 'var(--bh-shadow-dialog)' },
    },
    primary: {
      50: 'color-mix(in srgb, var(--PrimaryColor) 5%, var(--white))',
      100: 'color-mix(in srgb, var(--PrimaryColor) 10%, var(--white))',
      200: 'color-mix(in srgb, var(--PrimaryColor) 20%, var(--white))',
      300: 'color-mix(in srgb, var(--PrimaryColor) 40%, var(--white))',
      400: 'color-mix(in srgb, var(--PrimaryColor) 70%, var(--white))',
      500: 'var(--PrimaryColor)',
      600: 'color-mix(in srgb, var(--PrimaryColor) 90%, var(--Black))',
      700: 'color-mix(in srgb, var(--PrimaryColor) 80%, var(--Black))',
      800: 'color-mix(in srgb, var(--PrimaryColor) 70%, var(--Black))',
      900: 'color-mix(in srgb, var(--PrimaryColor) 60%, var(--Black))',
      950: 'color-mix(in srgb, var(--PrimaryColor) 50%, var(--Black))',
    },
    colorScheme: {
      light: identityColors,
      dark: identityColors,
    },
  },
  components: {
    checkbox: {
      root: { ...selectionColors, borderRadius: '0.375rem' },
      icon: { checkedColor: 'var(--bh-on-active)', checkedHoverColor: 'var(--bh-on-active)' },
    },
    radiobutton: {
      root: selectionColors,
      icon: { checkedColor: 'var(--bh-on-active)', checkedHoverColor: 'var(--bh-on-active)' },
    },
    toggleswitch: { colorScheme: { light: switchColors, dark: switchColors } },
    datepicker: {
      panel: { borderRadius: 'var(--bh-radius-card)' },
      date: { selectedBackground: 'var(--bh-active)', selectedColor: 'var(--bh-on-active)' },
    },
    button: {
      root: { borderRadius: 'var(--bh-radius-pill)', paddingX: '1.25rem', paddingY: '0.7rem' },
      colorScheme: {
        light: identityButtonColors,
        dark: identityButtonColors,
      },
    },
  },
});
