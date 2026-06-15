import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TitleInterface from '@/base/Data/Models/titleInterface';
import type AddDepartmentParams from '../../../core/params/add.department.params';
import DepartmentForm from '../DepartmentForm.vue';

vi.mock('@/modules/Stages/presentation/controllers/stage.controller', () => ({
  default: { getInstance: () => ({ fetchAsOptions: vi.fn().mockResolvedValue([]) }) },
}));

describe('DepartmentForm', () => {
  it('emits params containing the selected stage id', async () => {
    const wrapper = mount(DepartmentForm, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { UpdatedCustomInputSelect: true },
      },
    });

    wrapper
      .findComponent({ name: 'UpdatedCustomInputSelect' })
      .vm.$emit('update:modelValue', new TitleInterface({ id: 7, title: 'Secondary' }));
    await wrapper.vm.$nextTick();

    const events = wrapper.emitted('updateData') ?? [];
    const params = events.at(-1)?.[0] as AddDepartmentParams;
    expect(params.toMap().stage_id).toBe(7);
  });
});
