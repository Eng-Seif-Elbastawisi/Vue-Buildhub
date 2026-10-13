import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { flushPromises, type VueWrapper } from '@vue/test-utils';
import RadioButton from 'primevue/radiobutton';
import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
import TitleInterface from '@/base/Data/Models/titleInterface';
import { ValidationException } from '@/base/Core/Constants/exceptionConstants';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import ExecutionQuoteShowModel from '../../../../core/models/execution.quote.show.model';
import ScheduleGroupModel from '../../../../Schedule/core/models/schedule.group.model';
import ProjectFloorModel from '@/modules/MainOrganization/ProjectFloor/core/models/project.floor.model';
import PurchaseRequestController from '../../controllers/purchase-request.controller';
import PurchaseRequestFormDialog from '../PurchaseRequestFormDialog.vue';
import { mountDialog } from '../../../../SiteTeam/presentation/components/__tests__/harness';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import { timelineGroup, floorRecord } from '../../../__tests__/fixtures';
let post: ReturnType<typeof mockNetwork>;
const controller = PurchaseRequestController.getInstance();
beforeEach(() => {
  post = mockNetwork();
  post.mockImplementation(async (request) =>
    response({
      status: true,
      data: request.url.includes('fetch_employees')
        ? [{ id: 7, name: 'Responsible Employee' }]
        : request.url.includes('fetch_materials')
          ? [{ id: 5, title: 'Material Title' }]
          : request.url.includes('fetch_products')
            ? [{ id: 36, title: 'Product Title' }]
            : [],
    }),
  );
  controller.activate(140);
  controller.stagesState.value = new DataSuccess({
    data: [
      ScheduleGroupModel.fromJson({
        ...timelineGroup(),
        stages: [
          ...timelineGroup().stages,
          {
            ...timelineGroup().stages[0],
            id: 18,
            quote_stage_id: 4,
            stage: { id: 130, title: 'Second Stage' },
          },
        ],
      }),
    ],
  });
  controller.ownerState.value = new DataSuccess({
    data: ExecutionQuoteShowModel.fromJson({
      id: 140,
      project: { id: 86, title: 'Linked Project' },
    }),
  });
  controller.floorsState.value = new DataSuccess({
    data: [ProjectFloorModel.fromJson(floorRecord())],
  });
});
afterEach(() => {
  controller.release();
  vi.unstubAllGlobals();
});
async function select(wrapper: VueWrapper, id: string, option: { id: number; title: string }) {
  const input = wrapper
    .findAllComponents(UpdatedCustomInputSelect)
    .find((component) => component.props('id') === id);
  if (!input) throw new Error(`Missing select ${id}`);
  input.vm.$emit('update:modelValue', new TitleInterface(option));
  await flushPromises();
}
async function fill(wrapper: VueWrapper) {
  await select(wrapper, 'requirement-employee', { id: 7, title: 'Responsible Employee' });
  await select(wrapper, 'requirement-supply', { id: 2, title: 'Company' });
  await select(wrapper, 'requirement-item-0-stage', { id: 17, title: 'Main Stage' });
  await select(wrapper, 'requirement-item-0-catalog', { id: 5, title: 'Material Title' });
  await wrapper.get('#requirement-item-0-quantity').setValue('10.25');
}
function storeCalls() {
  return post.mock.calls.filter((call) => call[0].url.includes('store_purchase_request'));
}
it('shows backend item validation next to the affected quantity without losing input', async () => {
  const wrapper = mountDialog(PurchaseRequestFormDialog);
  await fill(wrapper);
  post.mockRejectedValueOnce(
    new ValidationException('Invalid quantity', {
      'items.0.quantity': ['Available stock is insufficient'],
    }),
  );
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(wrapper.get('#requirement-item-0-quantity-error').text()).toBe(
    'Available stock is insufficient',
  );
  expect(wrapper.get('#requirement-item-0-quantity').attributes('aria-invalid')).toBe('true');
  expect((wrapper.get('#requirement-item-0-quantity').element as HTMLInputElement).value).toBe(
    '10.25',
  );
  expect(wrapper.emitted('update:visible')).toBeUndefined();
  wrapper.unmount();
});
it('supports multiple independent item rows and validates every row before transport', async () => {
  const wrapper = mountDialog(PurchaseRequestFormDialog);
  await fill(wrapper);
  await wrapper.get('section[aria-labelledby="requirement-items"] > button').trigger('click');
  expect(wrapper.findAll('.procurement-item')).toHaveLength(2);
  await wrapper.get('form').trigger('submit');
  expect(storeCalls()).toHaveLength(0);
  expect(
    wrapper.findAll('[role="alert"]').some((alert) => alert.text().includes('Timeline Stage')),
  ).toBe(true);
  await select(wrapper, 'requirement-item-1-stage', { id: 18, title: 'Second Stage' });
  await select(wrapper, 'requirement-item-1-catalog', { id: 5, title: 'Material Title' });
  await wrapper.get('#requirement-item-1-quantity').setValue('0.50');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(storeCalls()[0]?.[0].data).toMatchObject({
    quote_id: 140,
    employee_id: 7,
    is_all_project: true,
    priority: 1,
    supply_responsibility: 2,
    items: [
      { project_timeline_stage_id: 17, itemable_type: 'material', itemable_id: 5, quantity: 10.25 },
      { project_timeline_stage_id: 18, itemable_type: 'material', itemable_id: 5, quantity: 0.5 },
    ],
  });
  expect(storeCalls()[0]?.[0].data).not.toHaveProperty('project_floor_space_id');
  expect(wrapper.emitted('update:visible')).toEqual([[false]]);
  wrapper.unmount();
});
it('preserves employee, scope and item lines after failed or unconfirmed Store responses', async () => {
  const wrapper = mountDialog(PurchaseRequestFormDialog);
  await fill(wrapper);
  post.mockResolvedValueOnce(response({ status: false, message: 'Quantity is not available' }));
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(wrapper.emitted('update:visible')).toBeUndefined();
  expect(wrapper.text()).toContain('Quantity is not available');
  expect((wrapper.get('#requirement-item-0-quantity').element as HTMLInputElement).value).toBe(
    '10.25',
  );
  const employeeSelect = wrapper
    .findAllComponents(UpdatedCustomInputSelect)
    .find((input) => input.props('id') === 'requirement-employee');
  expect(employeeSelect?.props('modelValue')).toMatchObject({ id: 7 });
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('store_purchase_request')
        ? { data: { id: 99 } }
        : { status: true, data: [] },
    ),
  );
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(wrapper.emitted('update:visible')).toBeUndefined();
  expect(wrapper.text()).toContain('did not explicitly confirm creation');
  post.mockImplementation(async () => response({ status: true, data: [] }));
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(wrapper.emitted('update:visible')).toEqual([[false]]);
  expect(post.mock.calls.some((call) => call[0].url.includes('fetch_purchase_requests'))).toBe(
    true,
  );
  wrapper.unmount();
});
it('submits the Project Floor Space association and clears it when switching to Entire Project', async () => {
  const wrapper = mountDialog(PurchaseRequestFormDialog);
  await fill(wrapper);
  const radio = wrapper
    .findAllComponents(RadioButton)
    .find((input) => input.props('inputId') === 'requirement-specific-space');
  radio?.vm.$emit('update:modelValue', false);
  await flushPromises();
  await wrapper.get('form').trigger('submit');
  expect(storeCalls()).toHaveLength(0);
  await select(wrapper, 'requirement-floor', { id: 23, title: 'Ground Floor' });
  const spaceSelect = wrapper
    .findAllComponents(UpdatedCustomInputSelect)
    .find((input) => input.props('id') === 'requirement-space');
  expect(spaceSelect?.props('staticOptions')).toEqual([
    expect.objectContaining({ id: 25, title: 'Living Room' }),
  ]);
  await select(wrapper, 'requirement-space', { id: 25, title: 'Living Room' });
  post.mockResolvedValueOnce(response({ status: false, message: 'Retry after correction' }));
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(storeCalls()[0]?.[0].data).toMatchObject({
    is_all_project: false,
    project_floor_space_id: 25,
  });
  wrapper
    .findAllComponents(RadioButton)
    .find((input) => input.props('inputId') === 'requirement-all-project')
    ?.vm.$emit('update:modelValue', true);
  await flushPromises();
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(storeCalls()[1]?.[0].data).not.toHaveProperty('project_floor_space_id');
  wrapper.unmount();
});
it('retains at least one item and keeps the entire-project flow usable without a linked Project', async () => {
  controller.ownerState.value = new DataSuccess({
    data: ExecutionQuoteShowModel.fromJson({ id: 140 }),
  });
  const wrapper = mountDialog(PurchaseRequestFormDialog);
  const remove = wrapper.findAll('button').find((button) => button.text() === 'Remove');
  expect(remove?.attributes('disabled')).toBeDefined();
  expect(wrapper.text()).toContain('Entire-project requirements remain available');
  await fill(wrapper);
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(storeCalls()).toHaveLength(1);
  wrapper.unmount();
});
