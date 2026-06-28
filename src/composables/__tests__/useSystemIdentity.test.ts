import { describe, expect, it, beforeEach } from 'vitest';
import { useSystemIdentity, type SystemPalette } from '../useSystemIdentity';

describe('useSystemIdentity', () => {
  const identity = useSystemIdentity();

  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('style');
    identity.applyPalette(identity.defaultPalette);
  });

  it('applies palettes to global css variables and localStorage', () => {
    const palette: SystemPalette = {
      name: 'Test Palette',
      primary: '#123456',
      secondary: '#101418',
      accent: '#ABCDEF',
    };

    identity.applyPalette(palette);

    expect(identity.currentPalette.value).toEqual(palette);
    expect(document.documentElement.style.getPropertyValue('--brand-primary')).toBe('#123456');
    expect(document.documentElement.style.getPropertyValue('--PrimaryColor')).toBe('#123456');
    expect(document.documentElement.style.getPropertyValue('--SecondaryColor')).toBe('#101418');
    expect(window.localStorage.getItem('systemIdentityPalette')).toContain('Test Palette');
  });

  it('loads a saved palette and reapplies variables', () => {
    window.localStorage.setItem(
      'systemIdentityPalette',
      JSON.stringify({
        name: 'Saved Palette',
        primary: '#2563EB',
        secondary: '#111827',
        accent: '#14B8A6',
      }),
    );

    const palette = identity.loadSavedPalette();

    expect(palette.name).toBe('Saved Palette');
    expect(document.documentElement.style.getPropertyValue('--button-primary-bg')).toBe('#2563EB');
    expect(document.documentElement.style.getPropertyValue('--accent-color')).toBe('#14B8A6');
  });

  it('resets to the default BuildHub palette', () => {
    identity.applyPalette({
      name: 'Temporary',
      primary: '#2563EB',
      secondary: '#111827',
      accent: '#14B8A6',
    });

    identity.resetPalette();

    expect(identity.currentPalette.value).toEqual(identity.defaultPalette);
    expect(document.documentElement.style.getPropertyValue('--brand-primary')).toBe(
      identity.defaultPalette.primary,
    );
  });
});
