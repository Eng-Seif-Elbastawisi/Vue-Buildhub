import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PackageModel from '../../../core/models/package.model';
import type AddPackageParams from '../../../core/params/add.package.params';
import PackageForm from '../PackageForm.vue';

vi.mock('vue-router', () => ({ onBeforeRouteLeave: vi.fn() }));

const global = {
  stubs: { DocumentIcon: true, FieldHelpIcon: true },
  mocks: { $t: (key: string) => key },
};

describe('PackageForm', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('emits the exact package fields from form inputs', async () => {
    const wrapper = mount(PackageForm, { global });

    await wrapper.find<HTMLInputElement>('#package-duration').setValue('12');
    await wrapper.find<HTMLInputElement>('#package-price').setValue('999.00');
    await wrapper.find<HTMLInputElement>('#package-projectnumbers').setValue('10');
    await wrapper.find<HTMLInputElement>('#package-employeenumbers').setValue('25');
    await wrapper.find<HTMLInputElement>('#package-hasmobild').setValue(true);
    await wrapper.find<HTMLInputElement>('#package-hasportal').setValue(true);

    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddPackageParams;
    expect(params.toMap()).toEqual({
      duration: 12,
      hasmobild: true,
      hasportal: true,
      projectnumbers: 10,
      employeenumbers: 25,
      price: '999.00',
    });
  });

  it('prefills package data for editing', () => {
    const wrapper = mount(PackageForm, {
      global,
      props: { packageData: PackageModel.example, loading: true },
    });

    expect(wrapper.find<HTMLInputElement>('#package-duration').element.value).toBe('12');
    expect(wrapper.find<HTMLInputElement>('#package-hasmobild').element.checked).toBe(true);
    expect(wrapper.find('.form-fields.disabled').exists()).toBe(true);
  });
});
