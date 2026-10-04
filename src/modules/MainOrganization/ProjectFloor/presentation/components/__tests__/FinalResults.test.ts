import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { Status } from '../../../core/constants/status.enum';
import AddFinalProjectFloorResultParams from '../../../core/params/final.result.project.floor.params';
import FinalResults from '../FinalResults.vue';

vi.mock('vue-i18n', () => ({
  createI18n: () => ({
    global: { t: (key: string) => key },
  }),
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/modules/MainOrganization/employee/presentation/controllers/employee.controller', () => ({
  default: {
    getInstance: () => ({
      listState: { value: { data: [{ id: 7, name: 'Pricing employee' }] } },
      fetchList: vi.fn(),
    }),
  },
}));

const dialogStub = {
  template: '<div><slot name="header"/><slot/><slot name="footer"/></div>',
};

const pricingSelectStub = {
  emits: ['update:modelValue'],
  template:
    '<button data-test="pricing-select" type="button" @click="$emit(\'update:modelValue\', { id: 7, title: \'Pricing employee\' })">select</button>',
};

describe('FinalResults.vue', () => {
  it('should be defined', () => {
    expect(FinalResults).toBeDefined();
  });

  it('requires the pricing employee, notification type, and message before submitting', async () => {
    const wrapper = mount(FinalResults, {
      props: {
        projectPreviewId: 15,
      },
      global: {
        stubs: {
          Dialog: dialogStub,
          FieldHelpIcon: true,
          UpdatedCustomInputSelect: pricingSelectStub,
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    await wrapper.findAll('.result-tab')[0]?.trigger('click');
    await wrapper.get('[data-test="pricing-select"]').trigger('click');
    await wrapper.findAll('.notification-tab')[0]?.trigger('click');

    const submitButton = wrapper.get('.dialog-btn--primary');
    expect(submitButton.attributes('disabled')).toBeDefined();

    await wrapper.get('#notification_message').setValue('  Ready for pricing  ');
    expect(submitButton.attributes('disabled')).toBeUndefined();

    await submitButton.trigger('click');

    const emittedParams = wrapper.emitted('submitFinalResult')?.[0]?.[0];
    expect(emittedParams).toBeInstanceOf(AddFinalProjectFloorResultParams);
    expect((emittedParams as AddFinalProjectFloorResultParams).notification_message).toBe(
      'Ready for pricing',
    );
  });

  it('submits not-ready status without requiring pricing or floor details', async () => {
    const wrapper = mount(FinalResults, {
      props: {
        projectPreviewId: 15,
      },
      global: {
        stubs: {
          Dialog: dialogStub,
          FieldHelpIcon: true,
          UpdatedCustomInputSelect: pricingSelectStub,
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    await wrapper.findAll('.result-tab')[2]?.trigger('click');

    const emittedParams = wrapper.emitted('submitFinalResult')?.[0]?.[0];
    expect(emittedParams).toBeInstanceOf(AddFinalProjectFloorResultParams);
    expect((emittedParams as AddFinalProjectFloorResultParams).toMap()).toEqual({
      project_preview_id: 15,
      status: Status.NOT_READY_FOR_COMPLETION,
    });
  });
});
