import { mount } from '@vue/test-utils';
import { expect, it } from 'vitest';
import StatusBadge from '../StatusBadge.vue';

it('updates caller-owned labels and severity without interpreting status values', async () => {
  const wrapper = mount(StatusBadge, { props: { label: 'Pending', severity: 'warning' } });
  expect(wrapper.text()).toBe('Pending');
  await wrapper.setProps({ label: 'تم التنفيذ', severity: 'success' });
  expect(wrapper.text()).toBe('تم التنفيذ');
  expect(wrapper.classes()).toContain('bh-status--success');
  expect(wrapper.classes()).not.toContain('bh-status--warning');
});

it('preserves slotted content and caller attributes in the optional dot variant', () => {
  const wrapper = mount(StatusBadge, {
    props: { variant: 'dot', icon: 'pi pi-check', label: 'Fallback' },
    attrs: { dir: 'rtl', 'aria-label': 'Existing status' },
    slots: { default: '<span>Available</span>' },
  });
  expect(wrapper.text()).toBe('Available');
  expect(wrapper.attributes('dir')).toBe('rtl');
  expect(wrapper.attributes('aria-label')).toBe('Existing status');
  expect(wrapper.classes()).toContain('bh-status--dot');
  expect(wrapper.get('i').attributes('aria-hidden')).toBe('true');
});
