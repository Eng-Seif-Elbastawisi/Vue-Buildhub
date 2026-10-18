import { afterEach, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import { DataEmpty } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import MaterialReceiptController from '../../controllers/material-receipt.controller';
import MaterialReceiptFormDialog from '../MaterialReceiptFormDialog.vue';

afterEach(() => {
  const controller = MaterialReceiptController.getInstance();
  controller.isStoring.value = false;
  controller.release();
});

it('blocks closing and resetting while a receipt is being saved', async () => {
  const controller = MaterialReceiptController.getInstance();
  controller.requestsState.value = new DataEmpty();
  controller.isStoring.value = true;
  const wrapper = mount(MaterialReceiptFormDialog, {
    props: { visible: true },
    global: {
      plugins: [PrimeVue],
      stubs: { UpdatedCustomInputSelect: true, FieldHelpIcon: true },
    },
  });
  const close = wrapper.findAll('button').find((button) => button.text() === 'Close');
  const cancel = wrapper.findAll('button').find((button) => button.text() === 'Clear Entry');
  if (!close || !cancel) throw new Error('Receipt actions are missing');
  expect(close.attributes('disabled')).toBeDefined();
  expect(cancel.attributes('disabled')).toBeDefined();
  await close.trigger('click');
  expect(wrapper.emitted('update:visible')).toBeUndefined();
  controller.isStoring.value = false;
  await wrapper.vm.$nextTick();
  await close.trigger('click');
  expect(wrapper.emitted('update:visible')).toEqual([[false]]);
  wrapper.unmount();
});
