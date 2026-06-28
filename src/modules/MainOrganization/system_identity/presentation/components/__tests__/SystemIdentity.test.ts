import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import { useSystemIdentity } from '@/composables/useSystemIdentity';
import SystemIdentity from '../SystemIdentity.vue';

describe('SystemIdentity.vue', () => {
  const identity = useSystemIdentity();

  const mountComponent = () => {
    return mount(SystemIdentity, {
      global: {
        mocks: {
          $t: (key: string) => key,
        },
      },
    });
  };

  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('style');
    identity.applyPalette(identity.defaultPalette);
  });

  it('renders the identity management sections', () => {
    const wrapper = mountComponent();

    expect(wrapper.text()).toContain('system_identity.title');
    expect(wrapper.text()).toContain('system_identity.logo_and_colors');
    expect(wrapper.text()).toContain('system_identity.current_colors');
    expect(wrapper.text()).toContain('system_identity.suggested_palettes');
  });

  it('applies a suggested identity palette', async () => {
    const wrapper = mountComponent();

    await wrapper.findAll('.palette-card .identity-button')[1].trigger('click');

    expect(document.documentElement.style.getPropertyValue('--brand-primary')).toBe('#2563EB');
    expect(wrapper.text()).toContain('system_identity.identity_applied');
  });

  it('resets to the default palette', async () => {
    identity.applyPalette({
      name: 'Temporary',
      primary: '#2563EB',
      secondary: '#111827',
      accent: '#14B8A6',
    });

    const wrapper = mountComponent();
    await wrapper.get('[data-testid="reset-identity"]').trigger('click');

    expect(identity.currentPalette.value).toEqual(identity.defaultPalette);
    expect(wrapper.text()).toContain('system_identity.identity_reset');
  });
});
