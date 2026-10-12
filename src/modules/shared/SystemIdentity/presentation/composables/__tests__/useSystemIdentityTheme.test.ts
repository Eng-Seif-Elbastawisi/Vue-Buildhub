import { beforeEach, describe, expect, it } from 'vitest';
import { useSystemIdentityTheme } from '../useSystemIdentityTheme';

describe('useSystemIdentityTheme', () => {
  const theme = useSystemIdentityTheme();

  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('style');
    theme.applyPalette(theme.defaultPalette);
  });

  it('applies palettes to global css variables and localStorage', () => {
    theme.applyPalette({
      name: 'Test Palette',
      primary: '#123456',
      secondary: '#101418',
      accent: '#ABCDEF',
    });

    expect(document.documentElement.style.getPropertyValue('--brand-primary')).toBe('#123456');
    expect(document.documentElement.style.getPropertyValue('--PrimaryColor')).toBe('#123456');
    expect(window.localStorage.getItem('systemIdentityPalette')).toContain('Test Palette');
  });

  it.each([
    ['#111827', '#FFFFFF'],
    ['#F1F5F9', '#101418'],
  ])('supplies readable header and sidebar text for secondary %s', (secondary, foreground) => {
    theme.applyPalette({
      name: 'Theme contrast',
      primary: '#2563EB',
      secondary,
      accent: '#14B8A6',
    });

    expect(document.documentElement.style.getPropertyValue('--SecondaryColor')).toBe(secondary);
    expect(document.documentElement.style.getPropertyValue('--secondary-text-color')).toBe(
      foreground,
    );
    expect(document.documentElement.style.getPropertyValue('--button-primary-color')).toBe(
      '#FFFFFF',
    );
  });

  it('keeps the active logo in the shared identity palette', () => {
    theme.applyPalette({
      name: 'Logo Identity',
      primary: '#123456',
      secondary: '#101418',
      accent: '#ABCDEF',
      logo: 'https://assets.test/logo.webp',
    });

    expect(theme.currentPalette.value.logo).toBe('https://assets.test/logo.webp');
    expect(window.localStorage.getItem('systemIdentityPalette')).toContain('logo.webp');
  });

  it('applies login setting colors and clears them on logout', () => {
    theme.applySettingTheme({
      primary_color: '#1a5fb4',
      secondary_color: '#613583',
      accent_color: '#a51d2d',
    });

    expect(document.documentElement.style.getPropertyValue('--brand-primary')).toBe('#1A5FB4');
    expect(document.documentElement.style.getPropertyValue('--brand-secondary')).toBe('#613583');
    expect(document.documentElement.style.getPropertyValue('--brand-accent')).toBe('#A51D2D');

    theme.clearSavedPalette();

    expect(window.localStorage.getItem('systemIdentityPalette')).toBeNull();
    expect(document.documentElement.style.getPropertyValue('--brand-primary')).toBe(
      theme.defaultPalette.primary,
    );
  });

  it('can apply persisted user settings without overwriting a newer saved palette', () => {
    theme.applyPalette({
      name: 'Saved Identity',
      primary: '#123456',
      secondary: '#101418',
      accent: '#ABCDEF',
    });

    theme.applySettingTheme(
      {
        name: 'Stale Login Identity',
        primary_color: '#B87333',
        secondary_color: '#101418',
        accent_color: '#C47A35',
      },
      { persist: false },
    );

    expect(document.documentElement.style.getPropertyValue('--brand-primary')).toBe('#B87333');
    expect(window.localStorage.getItem('systemIdentityPalette')).toContain('Saved Identity');

    theme.loadSavedPalette();

    expect(document.documentElement.style.getPropertyValue('--brand-primary')).toBe('#123456');
  });
});
