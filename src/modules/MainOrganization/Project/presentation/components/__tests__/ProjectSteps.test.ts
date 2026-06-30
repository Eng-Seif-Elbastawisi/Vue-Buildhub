import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ProjectSteps from '../ProjectSteps.vue';

describe('ProjectSteps.vue', () => {
  it('marks previous steps completed and current step active', () => {
    const wrapper = mount(ProjectSteps, {
      props: {
        currentStep: 2,
      },
    });

    const steps = wrapper.findAll('.project-steps__item');

    expect(steps).toHaveLength(3);
    expect(steps[0].classes()).toContain('completed');
    expect(steps[1].classes()).toContain('active');
    expect(steps[2].classes()).not.toContain('completed');
  });
});
