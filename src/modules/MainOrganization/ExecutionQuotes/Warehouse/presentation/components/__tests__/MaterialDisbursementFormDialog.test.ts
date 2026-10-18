import { afterEach, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import DisbursementStockModel from '../../../core/models/disbursement-stock.model';
import MaterialDisbursementRepository from '../../../data/repositories/material-disbursement.repository';
import { stockRecord } from '../../../__tests__/disbursement-fixtures';
import MaterialDisbursementController from '../../controllers/material-disbursement.controller';
import MaterialDisbursementFormDialog from '../MaterialDisbursementFormDialog.vue';

afterEach(() => {
  MaterialDisbursementController.getInstance().release();
  vi.restoreAllMocks();
});

async function mountForm() {
  const controller = MaterialDisbursementController.getInstance();
  controller.activate(140);
  vi.spyOn(MaterialDisbursementRepository.getInstance(), 'index').mockResolvedValue(
    new DataSuccess({ data: [DisbursementStockModel.fromJson(stockRecord())] }),
  );
  await controller.loadStock();
  const wrapper = mount(MaterialDisbursementFormDialog, {
    props: { visible: true },
    global: { plugins: [PrimeVue], stubs: { UpdatedCustomInputSelect: true, FieldHelpIcon: true } },
  });
  await flushPromises();
  return wrapper;
}

it('rejects overstock quantities without calling Store', async () => {
  const create = vi.spyOn(MaterialDisbursementRepository.getInstance(), 'create');
  const wrapper = await mountForm();
  await wrapper.get('#issue-select-9').setValue(true);
  await wrapper.get('#issue-9').setValue('4.01');
  await wrapper.get('form').trigger('submit');
  expect(create).not.toHaveBeenCalled();
  expect(wrapper.text()).toContain('do not exceed available stock');
  wrapper.unmount();
});

it('requires a receiver and keeps the entered quantity for correction', async () => {
  const create = vi.spyOn(MaterialDisbursementRepository.getInstance(), 'create');
  const wrapper = await mountForm();
  await wrapper.get('#issue-select-9').setValue(true);
  await wrapper.get('#issue-9').setValue('1.25');
  await wrapper.get('form').trigger('submit');
  expect(create).not.toHaveBeenCalled();
  expect(wrapper.text()).toContain('Select a valid receiving employee');
  expect(wrapper.get<HTMLInputElement>('#issue-9').element.value).toBe('1.25');
  wrapper.unmount();
});
