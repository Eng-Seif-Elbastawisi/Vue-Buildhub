import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Theme } from '@primeuix/themes';
import systemIdentityPreset from '../systemIdentityPreset';

describe('SYS Config control theme', () => {
  const previousTheme = Theme.getTheme();

  beforeEach(() => {
    Theme.setTheme({ preset: systemIdentityPreset, options: { darkModeSelector: '.dark' } });
  });

  afterEach(() => {
    Theme.setTheme(previousTheme);
  });

  it('generates controls with identity colors instead of the default Aura palette', () => {
    const semanticCss = Theme.getCommon().semantic.css;

    expect(semanticCss).toContain('--p-primary-color:var(--PrimaryColor)');
    expect(semanticCss).toContain('--p-primary-hover-color:var(--SecondaryColor)');
    expect(semanticCss).toContain('--p-highlight-background:var(--PrimaryColor-alpha-12)');
    expect(semanticCss).toContain('--p-primary-500:var(--PrimaryColor)');
    expect(semanticCss).not.toMatch(/--p-primary-\d+:var\(--p-emerald-/);
  });

  it('uses readable secondary text when primary buttons are hovered or pressed', () => {
    const buttonCss = Theme.getComponent('button').css;

    expect(buttonCss).toContain('--p-button-primary-hover-color:var(--secondary-text-color)');
    expect(buttonCss).toContain('--p-button-primary-active-color:var(--secondary-text-color)');
    expect(buttonCss).toContain('--p-button-primary-color:var(--p-primary-contrast-color)');
  });
});
