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
});
