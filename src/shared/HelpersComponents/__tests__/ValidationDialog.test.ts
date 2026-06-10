// import { describe, it, expect, vi } from 'vitest';
// import { mount } from '@vue/test-utils';
// import { ref } from 'vue';

// // Mock the ValidationService
// vi.mock('@/base/Presentation/Utils/validationService', () => {
//   return {
//     default: {
//       isOpen: ref(false),
//       message: ref(''),
//       openDialog: vi.fn(),
//       clearValidation: vi.fn(),
//     },
//   };
// });

// import ValidationService from '@/base/Presentation/Utils/validationService';

// const createWrapper = () => mount(ValidationDialog);

// // describe('ValidationDialog', () => {
// //   it('renders without crashing', () => {
// //     const wrapper = createWrapper();
// //     expect(wrapper.exists()).toBe(true);
// //   });

// //   it('is hidden when isOpen is false', () => {
// //     ValidationService.isOpen.value = false;
// //     const wrapper = createWrapper();
// //     expect(wrapper.find('.dialog-overlay').exists()).toBe(false);
// //   });

// //   it('is visible when isOpen is true', () => {
// //     ValidationService.isOpen.value = true;
// //     ValidationService.message.value = 'Required field';
// //     const wrapper = createWrapper();
// //     expect(wrapper.find('.dialog-overlay').exists()).toBe(true);
// //   });

// //   it('displays the validation message', () => {
// //     ValidationService.isOpen.value = true;
// //     ValidationService.message.value = 'Name is required';
// //     const wrapper = createWrapper();
// //     expect(wrapper.find('.dialog-message').text()).toBe('Name is required');
// //   });

// //   it('renders close button when visible', () => {
// //     ValidationService.isOpen.value = true;
// //     ValidationService.message.value = 'Error';
// //     const wrapper = createWrapper();
// //     expect(wrapper.find('.dialog-close-btn').text()).toBe('Close');
// //   });

// //   it('calls clearValidation when close button clicked', async () => {
// //     ValidationService.isOpen.value = true;
// //     ValidationService.message.value = 'Error';
// //     const wrapper = createWrapper();

// //     await wrapper.find('.dialog-close-btn').trigger('click');
// //     expect(ValidationService.clearValidation).toHaveBeenCalled();
// //   });

// //   it('calls clearValidation when overlay clicked', async () => {
// //     ValidationService.isOpen.value = true;
// //     ValidationService.message.value = 'Error';
// //     const wrapper = createWrapper();

// //     await wrapper.find('.dialog-overlay').trigger('click');
// //     expect(ValidationService.clearValidation).toHaveBeenCalled();
// //   });
// // });
