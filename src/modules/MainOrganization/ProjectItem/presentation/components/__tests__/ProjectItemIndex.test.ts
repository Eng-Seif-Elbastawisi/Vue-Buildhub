import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { ProjectItemPriceEnum } from '../../../core/constant/project.item.Price.enum';
import ProjectItemModel from '../../../core/models/project.Item.model';
import ProjectItemIndex from '../ProjectItemIndex.vue';

vi.mock('vue-i18n', () => ({
  createI18n: () => ({ global: { t: (key: string) => key } }),
  useI18n: () => ({ t: (key: string) => key }),
}));

const items = [
  new ProjectItemModel({
    id: 7,
    item: { id: 9, title: 'Concrete' },
    pricing_method: ProjectItemPriceEnum.GENERAL_ITEM,
    quantity: 3,
    price: 150,
    final_price: 450,
    project_floor_id: null,
    project_floor_number: null,
    project_floor_space_id: null,
    project_floor_space_title: null,
    created_at: '2026-07-01',
  }),
  new ProjectItemModel({
    id: 8,
    item: { id: 10, title: 'Paint' },
    pricing_method: ProjectItemPriceEnum.SPACE_RELATED,
    quantity: 2,
    price: 100,
    final_price: 200,
    project_floor_id: null,
    project_floor_number: null,
    project_floor_space_id: 6,
    project_floor_space_title: 'Lobby',
    created_at: '2026-07-02',
  }),
];

describe('ProjectItemIndex', () => {
  it('renders project items and total final price', () => {
    const wrapper = mount(ProjectItemIndex, {
      props: { items },
      global: { mocks: { $t: (key: string) => key } },
    });

    const inputValues = wrapper
      .findAll<HTMLInputElement>('input')
      .map((input) => input.element.value);

    expect(inputValues).toContain('Concrete');
    expect(inputValues).toContain('Paint');
    expect(wrapper.text()).toContain('Lobby');
    expect(wrapper.text()).toContain('650');
  });

  it('renders an empty state when there are no items', () => {
    const wrapper = mount(ProjectItemIndex, {
      props: { items: [] },
      global: { mocks: { $t: (key: string) => key } },
    });

    expect(wrapper.text()).toContain('project_item.no_items');
  });
});
