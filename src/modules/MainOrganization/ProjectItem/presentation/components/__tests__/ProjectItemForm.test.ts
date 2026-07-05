import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectItemPriceEnum } from '../../../core/constant/project.item.Price.enum';
import ProjectItemShowModel from '../../../core/models/project.Item.show.model';
import AddProjectItemParams from '../../../core/params/add.project.Item.params';
import ProjectItemForm from '../ProjectItemForm.vue';

vi.mock('vue-router', () => ({
  onBeforeRouteLeave: vi.fn(),
  useRoute: () => ({ fullPath: '/item/add', params: {}, query: {} }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    resolve: vi.fn(),
  }),
  createRouter: vi.fn(() => ({
    install: vi.fn(),
    push: vi.fn(),
    resolve: vi.fn(),
    afterEach: vi.fn(),
    beforeEach: vi.fn(),
  })),
  createWebHistory: vi.fn(),
}));

vi.mock('@/modules/shared/Item/presentation/controllers/Item.controller', () => ({
  default: { getInstance: () => ({}) },
}));

const SelectStub = {
  props: ['id'],
  emits: ['update:modelValue'],
  template:
    '<button :class="id" @click="$emit(\'update:modelValue\', optionFor(id))">select</button>',
  methods: {
    optionFor(id: string) {
      const options: Record<string, { id: number; title: string }> = {
        'project-item-item': { id: 9, title: 'Concrete' },
        'project-item-pricing-method': {
          id: ProjectItemPriceEnum.GENERAL_ITEM,
          title: 'General item',
        },
      };
      return options[id];
    },
  },
};

describe('ProjectItemForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('emits complete item params from form inputs', async () => {
    const wrapper = mount(ProjectItemForm, {
      props: { project: 4 },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { UpdatedCustomInputSelect: SelectStub },
      },
    });

    await wrapper.find('.project-item-item').trigger('click');
    await wrapper.find('.project-item-pricing-method').trigger('click');
    await wrapper.find<HTMLInputElement>('#project-item-price').setValue('250');
    await wrapper.find<HTMLInputElement>('#project-item-quantity').setValue('3');

    const emissions = wrapper.emitted('updateData') as unknown[][];
    const params = emissions.at(-1)?.[0] as AddProjectItemParams;

    expect(params.toMap()).toEqual({
      project_id: 4,
      price: 250,
      quantity: 3,
      item_id: 9,
      pricing_method: ProjectItemPriceEnum.GENERAL_ITEM,
    });
  });

  it('prefills values from an existing item', () => {
    const wrapper = mount(ProjectItemForm, {
      props: { item: ProjectItemShowModel.example, loading: true },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { UpdatedCustomInputSelect: SelectStub },
      },
    });

    expect(wrapper.find<HTMLInputElement>('#project-item-price').element.value).toBe(
      String(ProjectItemShowModel.example.price),
    );
    expect(wrapper.find('.form-fields.disabled').exists()).toBe(true);
    expect(wrapper.emitted('updateData')?.[0]?.[0]).toBeInstanceOf(AddProjectItemParams);
  });
});
