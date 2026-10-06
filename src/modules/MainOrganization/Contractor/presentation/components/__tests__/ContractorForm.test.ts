import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import StageModel from '@/modules/shared/Stages/core/models/stage.model';
import ContractorModel from '../../../core/models/contractor.model';
import ContractorForm from '../ContractorForm.vue';

const CustomSelectStub = {
  name: 'CustomSelect',
  props: ['modelValue', 'params', 'type'],
  emits: ['update:modelValue'],
  template:
    "<button class=\"stage-select\" @click=\"$emit('update:modelValue', [{ id: 1, title: 'Design' }, { id: 4, title: 'Build' }])\">stages</button>",
};

describe('ContractorForm', () => {
  it('uses the main-stage select and emits only name plus stage IDs', async () => {
    const wrapper = mount(ContractorForm, {
      global: { mocks: { $t: (key: string) => key }, stubs: { CustomSelect: CustomSelectStub } },
    });

    expect(wrapper.getComponent(CustomSelectStub).props('type')).toBe(2);
    expect(wrapper.getComponent(CustomSelectStub).props('params').toMap()).toMatchObject({
      parent_id: null,
    });
    await wrapper.get('#contractor-name').setValue('  Builder  ');
    await wrapper.get('.stage-select').trigger('click');

    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as { toMap: () => unknown };
    expect(params.toMap()).toEqual({ name: 'Builder', stage_ids: [1, 4] });
  });

  it('populates edit selection from the contractor stages', () => {
    const mainStage = StageModel.fromJson({ id: 4, title: 'Build', parent_id: null });
    const contractor = new ContractorModel(9, 'Builder', [4], [mainStage]);
    const wrapper = mount(ContractorForm, {
      props: { contractor },
      global: { mocks: { $t: (key: string) => key }, stubs: { CustomSelect: CustomSelectStub } },
    });

    expect(wrapper.get<HTMLInputElement>('#contractor-name').element.value).toBe('Builder');
    expect(wrapper.getComponent(CustomSelectStub).props('modelValue')).toMatchObject([
      { id: 4, title: 'Build' },
    ]);
  });
});
