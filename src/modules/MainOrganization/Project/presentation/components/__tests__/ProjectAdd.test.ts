import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddProjectParams from '../../../core/params/add.project.params';
import { ServiceType } from '../../../core/constants/serviceType.enum';
import ProjectAdd from '../ProjectAdd.vue';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  toastWarning: vi.fn(),
  errorMessage: { value: null as string | null },
}));

vi.mock('../../controllers/project.controller', () => ({
  default: {
    getInstance: () => ({
      create: mocks.create,
      errorMessage: mocks.errorMessage,
    }),
  },
}));

vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: {
    toastWarning: mocks.toastWarning,
  },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({
    fullPath: '/organization/project/add',
  }),
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

vi.mock('vue-i18n', () => ({
  createI18n: () => ({
    global: {
      t: (key: string) => key,
    },
  }),
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('primevue/radiobutton', () => ({
  default: {
    props: ['modelValue', 'inputId', 'name', 'value'],
    emits: ['update:modelValue'],
    template:
      '<input :id="inputId" type="radio" :name="name" :value="value" :checked="modelValue === value" @change="$emit(\'update:modelValue\', value)" />',
  },
}));

describe('ProjectAdd.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.create.mockResolvedValue({});
    mocks.errorMessage.value = null;
  });

  it('should be defined', () => {
    expect(ProjectAdd).toBeDefined();
  });

  it('does not create a project when emitted params have an empty title', async () => {
    const invalidParams = new AddProjectParams({
      translations: new TranslationParams({ title: { en: ' ', ar: '' } }),
    });

    const wrapper = mount(ProjectAdd, {
      global: {
        stubs: {
          ProjectSteps: {
            template: '<div />',
          },
          ProjectForm: {
            emits: ['updateData'],
            template:
              '<button data-test="emit-invalid" type="button" @click="$emit(\'updateData\', invalidParams)">emit</button>',
            setup: () => ({ invalidParams }),
          },
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    await wrapper.find('[data-test="emit-invalid"]').trigger('click');
    await wrapper.find('.btn-primary').trigger('click');
    await flushPromises();

    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.toastWarning).toHaveBeenCalledWith('validation.title_required');
  });

  it('does not create a project when required select values are missing', async () => {
    const invalidParams = new AddProjectParams({
      translations: new TranslationParams({ title: { en: 'Project title' } }),
      client_exist: false,
    });

    const wrapper = mount(ProjectAdd, {
      global: {
        stubs: {
          ProjectSteps: {
            template: '<div />',
          },
          ProjectForm: {
            emits: ['updateData'],
            template:
              '<button data-test="emit-invalid" type="button" @click="$emit(\'updateData\', invalidParams)">emit</button>',
            setup: () => ({ invalidParams }),
          },
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    await wrapper.find('[data-test="emit-invalid"]').trigger('click');
    await wrapper.find('.btn-primary').trigger('click');
    await flushPromises();

    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.toastWarning).toHaveBeenCalled();
  });

  it.each([
    ['preview', 'preview'],
    ['floor', 'floor'],
  ] as const)('keeps %s frontend-only and passes it as the post-create step', async (_, step) => {
    const validParams = new AddProjectParams({
      translations: new TranslationParams({ title: { en: 'Project title' } }),
      client_exist: true,
      client_id: 4,
      project_type_id: 5,
      location_id: 6,
      service_type: ServiceType.BOTH,
    });

    const wrapper = mount(ProjectAdd, {
      global: {
        stubs: {
          ProjectSteps: {
            template: '<div />',
          },
          ProjectForm: {
            emits: ['updateData'],
            template:
              '<button data-test="emit-valid" type="button" @click="$emit(\'updateData\', validParams)">emit</button>',
            setup: () => ({ validParams }),
          },
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    if (step === 'floor') {
      await wrapper.get('#project-next-step-floor').setValue();
    }

    await wrapper.get('[data-test="emit-valid"]').trigger('click');
    await wrapper.get('.btn-primary').trigger('click');
    await flushPromises();

    expect(mocks.create).toHaveBeenCalledWith(
      validParams,
      undefined,
      '/organization/project/add',
      step,
    );
    expect(validParams.toMap()).not.toHaveProperty('nextStep');
    expect(validParams.toMap()).not.toHaveProperty('next_step');
  });
});
