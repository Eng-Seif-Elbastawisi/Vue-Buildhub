import { mount } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import StandardFormLayout from '../StandardFormLayout.vue';

// The wrapper must not intercept native forms or disconnect caller-owned fields.
it('keeps nested dynamic fields and caller submit/cancel actions connected', async () => {
  const submit = vi.fn();
  const cancel = vi.fn();
  const wrapper = mount(
    defineComponent({
      components: { StandardFormLayout },
      setup() {
        const lines = ref(['First']);
        return { lines, submit, cancel };
      },
      template: `
      <StandardFormLayout as="form" mode="edit" @submit.prevent="submit(lines)">
        <div class="form-fields">
          <input v-for="(_, index) in lines" :key="index" v-model="lines[index]" />
          <button type="button" @click="lines.push('')">Add line</button>
        </div>
        <template #actions>
          <button type="button" @click="cancel">Cancel</button>
          <button type="submit">Save</button>
        </template>
      </StandardFormLayout>`,
    }),
  );
  await wrapper.get('.form-fields button').trigger('click');
  await wrapper.get('input:nth-of-type(2)').setValue('Second');
  await wrapper.get('form').trigger('submit');
  expect(submit.mock.calls.at(0)?.[0]).toEqual(['First', 'Second']);
  await wrapper.get('footer button').trigger('click');
  expect(cancel).toHaveBeenCalledOnce();
  expect(submit).toHaveBeenCalledOnce();
});

describe('StandardFormLayout', () => {
  it('keeps read-only records as values and caller-owned optional actions', () => {
    const wrapper = mount(StandardFormLayout, {
      props: { mode: 'show', title: 'Record', description: 'Existing details', loading: true },
      slots: {
        default: '<dl><dt>Reference</dt><dd>BH-42</dd></dl>',
        loading: '<p role="status">Loading related records</p>',
        actions: '<a href="/organization/project/edit/42">Edit</a>',
      },
    });
    expect(wrapper.get('dd').text()).toBe('BH-42');
    expect(wrapper.find('input').exists()).toBe(false);
    expect(wrapper.get('[role="status"]').text()).toBe('Loading related records');
    expect(wrapper.get('footer a').attributes('href')).toBe('/organization/project/edit/42');
  });
});
