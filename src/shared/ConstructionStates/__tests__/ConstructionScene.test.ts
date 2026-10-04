import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ConstructionScene from '../ConstructionScene.vue';

describe('ConstructionScene', () => {
  it('uses a one-time failure scene and a distinct crane loading scene', () => {
    const failure = mount(ConstructionScene, { props: { variant: '500' } });
    const loading = mount(ConstructionScene, { props: { variant: 'loading' } });

    expect(failure.find('.scene-top-block').exists()).toBe(true);
    expect(failure.find('.scene-crane').exists()).toBe(false);
    expect(loading.find('.scene-crane').exists()).toBe(true);
    expect(loading.find('.scene-load').exists()).toBe(true);
  });

  it('shows the stuck block and warning for delete errors', () => {
    const wrapper = mount(ConstructionScene, { props: { variant: 'delete-error' } });
    expect(wrapper.find('.scene-stuck-block').exists()).toBe(true);
    expect(wrapper.find('.scene-warning-mark').exists()).toBe(true);
  });
});
