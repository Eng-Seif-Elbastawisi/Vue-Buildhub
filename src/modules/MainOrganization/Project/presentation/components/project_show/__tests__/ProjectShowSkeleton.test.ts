import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ProjectShowSkeleton from '../ProjectShowSkeleton.vue';

describe('ProjectShowSkeleton', () => {
  it('mirrors the project hero, summary, tabs, and two-column content structure', () => {
    const wrapper = mount(ProjectShowSkeleton, {
      global: { mocks: { $t: () => 'Loading...' } },
    });

    expect(wrapper.attributes('role')).toBe('status');
    expect(wrapper.attributes('aria-busy')).toBe('true');
    expect(wrapper.text()).toContain('Loading...');
    expect(wrapper.find('.project-hero').exists()).toBe(true);
    expect(wrapper.findAll('.project-show-skeleton__stat')).toHaveLength(4);
    expect(wrapper.findAll('.project-show-skeleton__tab')).toHaveLength(7);
    expect(wrapper.find('.project-dashboard-main .project-show-skeleton__info').exists()).toBe(
      true,
    );
    expect(wrapper.find('.project-dashboard-main .project-show-skeleton__pricing').exists()).toBe(
      true,
    );
    expect(wrapper.find('.project-dashboard-side .project-show-skeleton__preview').exists()).toBe(
      true,
    );
  });
});
