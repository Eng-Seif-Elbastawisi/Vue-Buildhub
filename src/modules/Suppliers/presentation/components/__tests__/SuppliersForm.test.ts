import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import SuppliersShowModel from '../../../core/models/Suppliers.show.model';
import SuppliersForm from '../SuppliersForm.vue';

vi.mock('vue-router', () => ({ onBeforeRouteLeave: vi.fn() }));

describe('SuppliersForm', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('emits supplier form values as AddSuppliersParams', async () => {
    const wrapper = mount(SuppliersForm, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { DocumentIcon: true },
      },
    });

    await wrapper.find<HTMLInputElement>('#supplier-name').setValue('Build Supply');
    await wrapper.find<HTMLInputElement>('#supplier-specialization').setValue('Concrete');
    await wrapper.find<HTMLInputElement>('#supplier-phone').setValue('01000000000');
    await wrapper.find<HTMLInputElement>('#supplier-materials').setValue('Cement');

    const emissions = wrapper.emitted('updateData') as unknown[][];
    const params = emissions.at(-1)?.[0] as { toMap: () => Record<string, unknown> };

    expect(params.toMap()).toEqual({
      name: 'Build Supply',
      Specialization: 'Concrete',
      phone: '01000000000',
      materials: 'Cement',
    });
  });

  it('hydrates edit values from the supplier prop', async () => {
    const wrapper = mount(SuppliersForm, {
      props: {
        supplier: new SuppliersShowModel({
          id: 3,
          Supplier: 'Acme Supplier',
          spacification: 'Steel',
          phone: '01111111111',
          materials: 'Rebar',
        }),
      },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { DocumentIcon: true },
      },
    });

    expect(wrapper.find<HTMLInputElement>('#supplier-name').element.value).toBe('Acme Supplier');
    expect(wrapper.find<HTMLInputElement>('#supplier-specialization').element.value).toBe('Steel');
    expect(wrapper.find<HTMLInputElement>('#supplier-phone').element.value).toBe('01111111111');
    expect(wrapper.find<HTMLInputElement>('#supplier-materials').element.value).toBe('Rebar');
  });
});
