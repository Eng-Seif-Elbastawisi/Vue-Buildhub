import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createI18n } from 'vue-i18n';
import PrimeVue from 'primevue/config';
import RadioButton from 'primevue/radiobutton';
import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
import TitleInterface from '@/base/Data/Models/titleInterface';
import { ValidationException } from '@/base/Core/Constants/exceptionConstants';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import ExecutionQuoteShowModel from '../../../../core/models/execution.quote.show.model';
import ScheduleGroupModel from '../../../../Schedule/core/models/schedule.group.model';
import ProjectFloorModel from '@/modules/MainOrganization/ProjectFloor/core/models/project.floor.model';
import PurchaseRequestController from '../../controllers/purchase-request.controller';
import PurchaseRequestCreatePage from '../PurchaseRequestCreatePage.vue';
import ProcurementDiscardConfirmation from '../ProcurementDiscardConfirmation.vue';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import { timelineGroup, floorRecord } from '../../../__tests__/fixtures';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
let post: ReturnType<typeof mockNetwork>;
const controller = PurchaseRequestController.getInstance();
const base = '/organization/execution-quotes/show/140/procurement';
function executionTimeline() {
  const group = timelineGroup();
  return {
    status: true,
    data: {
      basicData: { count_timeline: 1 },
      data: [{ ...group, stages: [...group.stages, { ...group.stages[0], id: 18 }] }],
    },
  };
}

beforeEach(() => {
  post = mockNetwork();
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('fetch_project_timelines')
        ? executionTimeline()
        : {
            status: true,
            data: request.url.includes('fetch_employees')
              ? [{ id: 7, name: 'Responsible Employee' }]
              : request.url.includes('fetch_materials')
                ? [{ id: 5, title: 'Material Title' }]
                : request.url.includes('fetch_products')
                  ? [{ id: 36, title: 'Product Title' }]
                  : [],
          },
    ),
  );
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
});
afterEach(() => {
  controller.release();
  vi.unstubAllGlobals();
});
async function mountPage(locale: 'en' | 'ar' = 'en') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/organization/execution-quotes/show/:id', component: { template: '<div />' } },
      {
        path: '/organization/execution-quotes/show/:id/procurement',
        component: { template: '<main class="procurement-return" />' },
      },
      {
        path: '/organization/execution-quotes/show/:id/procurement/purchase-requests/add',
        component: PurchaseRequestCreatePage,
      },
    ],
  });
  await router.push(`${base}/purchase-requests/add`);
  const localization = createI18n({ legacy: false, locale, messages: { en, ar } });
  const wrapper = mount(
    { template: '<RouterView />' },
    {
      attachTo: document.body,
      global: {
        plugins: [router, PrimeVue, localization],
        mocks: { $t: localization.global.t },
        stubs: { ProjectWorkspaceNav: true, FieldHelpIcon: true },
      },
    },
  );
  await flushPromises();
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
  await flushPromises();
  return { wrapper, router };
}
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
it.each(['en', 'ar'] as const)('opens directly with every section in %s', async (locale) => {
  const { wrapper, router } = await mountPage(locale);
  expect(router.currentRoute.value.params.id).toBe('140');
  expect(controller.projectId.value).toBe(86);
  expect(
    post.mock.calls.find((call) => call[0].url.includes('fetch_purchase_requests'))?.[0].data,
  ).toEqual({ quote_id: 140 });
  expect(wrapper.get('.purchase-request-create').attributes('dir')).toBe(
    locale === 'ar' ? 'rtl' : 'ltr',
  );
  expect(wrapper.get('.purchase-request-breadcrumbs').text()).toContain(
    locale === 'ar' ? 'طلب شراء جديد' : 'New Purchase Request',
  );
  for (const id of ['requirement-general', 'requirement-scope-heading', 'requirement-items'])
    expect(wrapper.find(`#${id}`).exists()).toBe(true);
  for (const id of ['requirement-employee', 'requirement-supply', 'requirement-priority'])
    expect(
      wrapper.findAllComponents(UpdatedCustomInputSelect).some((field) => field.props('id') === id),
    ).toBe(true);
  expect(wrapper.findAll('.procurement-item')).toHaveLength(1);
  wrapper.unmount();
});
it('confirms unsaved changes on Cancel and keeps the draft when editing continues', async () => {
  const { wrapper, router } = await mountPage();
  await fill(wrapper);
  await wrapper
    .findAll('.procurement-actions button')
    .find((button) => button.text() === 'Cancel')
    ?.trigger('click');
  await flushPromises();
  const prompt = wrapper.getComponent(ProcurementDiscardConfirmation);
  expect(prompt.props('visible')).toBe(true);
  prompt.vm.$emit('keep');
  await flushPromises();
  expect(router.currentRoute.value.path).toBe(`${base}/purchase-requests/add`);
  expect(wrapper.get<HTMLInputElement>('#requirement-item-0-quantity').element.value).toBe('10.25');
  await wrapper
    .findAll('.procurement-actions button')
    .find((button) => button.text() === 'Cancel')
    ?.trigger('click');
  await flushPromises();
  prompt.vm.$emit('discard');
  await flushPromises();
  expect(router.currentRoute.value.path).toBe(base);
  expect(storeCalls()).toHaveLength(0);
  wrapper.unmount();
});
it('focuses the first invalid field after submission', async () => {
  const { wrapper } = await mountPage();
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(document.activeElement?.id).toBe('requirement-employee');
  wrapper.unmount();
});
it('asks the browser to confirm a refresh when the request has unsaved changes', async () => {
  const { wrapper } = await mountPage();
  await fill(wrapper);
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(true);
  wrapper.unmount();
});
it('keeps the existing product selector and serializes a product item', async () => {
  const { wrapper, router } = await mountPage();
  await fill(wrapper);
  wrapper
    .findAllComponents(RadioButton)
    .find((input) => input.props('inputId') === 'requirement-item-0-product')
    ?.vm.$emit('update:modelValue', 'product');
  await flushPromises();
  const catalog = wrapper
    .findAllComponents(UpdatedCustomInputSelect)
    .find((input) => input.props('id') === 'requirement-item-0-catalog');
  expect(catalog?.props('modelValue')).toBeNull();
  expect(catalog?.props('label')).toBe('procurement.product');
  await select(wrapper, 'requirement-item-0-catalog', { id: 36, title: 'Product Title' });
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(storeCalls()[0]?.[0].data.items).toEqual([
    { project_timeline_stage_id: 17, itemable_type: 'product', itemable_id: 36, quantity: 10.25 },
  ]);
  expect(router.currentRoute.value.path).toBe(base);
  wrapper.unmount();
});
it('removes one requested item while keeping another row and its fields', async () => {
  const { wrapper } = await mountPage();
  await fill(wrapper);
  await wrapper
    .get('section[aria-labelledby="requirement-items"] .action-row button')
    .trigger('click');
  await select(wrapper, 'requirement-item-1-stage', { id: 18, title: 'Second Stage' });
  await wrapper
    .findAll('.procurement-item')[0]
    ?.findAll('button')
    .find((button) => button.text() === 'Remove')
    ?.trigger('click');
  await flushPromises();
  expect(wrapper.findAll('.procurement-item')).toHaveLength(1);
  expect(wrapper.get('.purchase-request-item-count').text()).toContain('1');
  expect(wrapper.get('#requirement-item-1-stage')).toBeDefined();
  wrapper.unmount();
});
it('shows backend item validation next to the affected quantity without losing input', async () => {
  const { wrapper, router } = await mountPage();
  await fill(wrapper);
  post.mockResolvedValueOnce(response(executionTimeline())).mockRejectedValueOnce(
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
  expect(router.currentRoute.value.path).toBe(`${base}/purchase-requests/add`);
  wrapper.unmount();
});
it('supports multiple independent item rows and validates every row before transport', async () => {
  const { wrapper, router } = await mountPage();
  await fill(wrapper);
  await wrapper
    .get('section[aria-labelledby="requirement-items"] .action-row button')
    .trigger('click');
  expect(wrapper.findAll('.procurement-item')).toHaveLength(2);
  await wrapper.get('form').trigger('submit');
  expect(storeCalls()).toHaveLength(0);
  expect(document.activeElement?.id).toBe('requirement-item-1-stage');
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
  expect(router.currentRoute.value.path).toBe(base);
  wrapper.unmount();
});
it('preserves employee, scope and item lines after failed or unconfirmed Store responses', async () => {
  const { wrapper, router } = await mountPage();
  await fill(wrapper);
  post
    .mockResolvedValueOnce(response(executionTimeline()))
    .mockResolvedValueOnce(response({ status: false, message: 'Quantity is not available' }));
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(router.currentRoute.value.path).toBe(`${base}/purchase-requests/add`);
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
      request.url.includes('fetch_project_timelines')
        ? executionTimeline()
        : request.url.includes('store_purchase_request')
          ? { data: { id: 99 } }
          : { status: true, data: [] },
    ),
  );
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(router.currentRoute.value.path).toBe(`${base}/purchase-requests/add`);
  expect(wrapper.text()).toContain('did not explicitly confirm creation');
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('fetch_project_timelines')
        ? executionTimeline()
        : { status: true, data: [] },
    ),
  );
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(router.currentRoute.value.path).toBe(base);
  expect(post.mock.calls.some((call) => call[0].url.includes('fetch_purchase_requests'))).toBe(
    true,
  );
  wrapper.unmount();
});
it('submits the Project Floor Space association and clears it when switching to Entire Project', async () => {
  const { wrapper } = await mountPage();
  await fill(wrapper);
  const radio = wrapper
    .findAllComponents(RadioButton)
    .find((input) => input.props('inputId') === 'requirement-specific-space');
  radio?.vm.$emit('update:modelValue', false);
  await flushPromises();
  await wrapper.get('form').trigger('submit');
  expect(storeCalls()).toHaveLength(0);
  expect(document.activeElement?.id).toBe('requirement-floor');
  await select(wrapper, 'requirement-floor', { id: 23, title: 'Ground Floor' });
  const spaceSelect = wrapper
    .findAllComponents(UpdatedCustomInputSelect)
    .find((input) => input.props('id') === 'requirement-space');
  expect(spaceSelect?.props('staticOptions')).toEqual([
    expect.objectContaining({ id: 25, title: 'Living Room' }),
  ]);
  await select(wrapper, 'requirement-space', { id: 25, title: 'Living Room' });
  post
    .mockResolvedValueOnce(response(executionTimeline()))
    .mockResolvedValueOnce(response({ status: false, message: 'Retry after correction' }));
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
it('clears only the dependent space when the floor changes', async () => {
  const { wrapper } = await mountPage();
  await fill(wrapper);
  controller.floorsState.value = new DataSuccess({
    data: [
      ProjectFloorModel.fromJson(floorRecord()),
      ProjectFloorModel.fromJson({ ...floorRecord(), id: 24, floor_number: 1, spaces: [] }),
    ],
  });
  wrapper
    .findAllComponents(RadioButton)
    .find((input) => input.props('inputId') === 'requirement-specific-space')
    ?.vm.$emit('update:modelValue', false);
  await flushPromises();
  await select(wrapper, 'requirement-floor', { id: 23, title: 'Ground Floor' });
  await select(wrapper, 'requirement-space', { id: 25, title: 'Living Room' });
  await select(wrapper, 'requirement-floor', { id: 24, title: 'Floor 1' });
  const fields = wrapper.findAllComponents(UpdatedCustomInputSelect);
  expect(
    fields.find((field) => field.props('id') === 'requirement-space')?.props('modelValue'),
  ).toBeNull();
  expect(
    fields.find((field) => field.props('id') === 'requirement-employee')?.props('modelValue'),
  ).toMatchObject({ id: 7 });
  expect(wrapper.get<HTMLInputElement>('#requirement-item-0-quantity').element.value).toBe('10.25');
  wrapper.unmount();
});
it('retains at least one item and keeps the entire-project flow usable without a linked Project', async () => {
  const { wrapper } = await mountPage();
  controller.ownerState.value = new DataSuccess({
    data: ExecutionQuoteShowModel.fromJson({ id: 140 }),
  });
  await flushPromises();
  const remove = wrapper.findAll('button').find((button) => button.text() === 'Remove');
  expect(remove?.attributes('disabled')).toBeDefined();
  expect(wrapper.text()).toContain('You can still request items for the entire project');
  await fill(wrapper);
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(storeCalls()).toHaveLength(1);
  wrapper.unmount();
});
