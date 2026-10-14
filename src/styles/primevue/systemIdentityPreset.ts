import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const identityColors = {
  primary: {
    color: 'var(--PrimaryColor)',
    contrastColor: 'var(--button-primary-color)',
    hoverColor: 'var(--SecondaryColor)',
    activeColor: 'var(--SecondaryColor)',
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

export default definePreset(Aura, {
  semantic: {
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
    button: {
      colorScheme: {
        light: identityButtonColors,
        dark: identityButtonColors,
      },
    },
  },
});
