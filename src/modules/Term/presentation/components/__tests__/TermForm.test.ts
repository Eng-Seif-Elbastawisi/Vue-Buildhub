import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TitleInterface from '@/base/Data/Models/titleInterface';
import type AddTermParams from '../../../core/params/add.term.params';
import TermForm from '../TermForm.vue';

vi.mock('@/modules/Department/presentation/controllers/department.controller', () => ({
  default: { getInstance: () => ({ fetchAsOptions: vi.fn().mockResolvedValue([]) }) },
}));

describe('TermForm', () => {
  it('emits params containing the selected department id', async () => {
    const wrapper = mount(TermForm, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { UpdatedCustomInputSelect: true },
      },
    });

    wrapper
      .findComponent({ name: 'UpdatedCustomInputSelect' })
      .vm.$emit('update:modelValue', new TitleInterface({ id: 7, title: 'Science' }));
    await wrapper.vm.$nextTick();

    const events = wrapper.emitted('updateData') ?? [];
    const params = events.at(-1)?.[0] as AddTermParams;
    expect(params.toMap().department_id).toBe(7);
  });
});
