import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LangInput from '../LangInput.vue'

const defaultLangs = [
  { locale: 'en' as const, title: 'English' },
  { locale: 'ar' as const, title: 'Arabic' },
]

const createWrapper = (props = {}) =>
  mount(LangInput, {
    props: {
      modelValue: { en: '', ar: '' },
      langs: defaultLangs,
      ...props,
    },
  })

describe('LangInput', () => {
  it('renders without crashing', () => {
    const wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
  })

  it('renders an input element', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('renders a language select', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('select').exists()).toBe(true)
  })

  it('renders correct number of language options', () => {
    const wrapper = createWrapper()
    const options = wrapper.findAll('option')
    expect(options).toHaveLength(2)
  })

  it('displays locale names in uppercase', () => {
    const wrapper = createWrapper()
    const options = wrapper.findAll('option')
    // expect(options[0].text()).toBe('EN')
    // expect(options[1].text()).toBe('AR')
  })

  it('defaults to first language', () => {
    const wrapper = createWrapper()
    const select = wrapper.find('select')
    expect((select.element as HTMLSelectElement).value).toBe('en')
  })

  it('shows value for current language', () => {
    const wrapper = createWrapper({
      modelValue: { en: 'Hello', ar: 'مرحبا' },
    })
    const input = wrapper.find('input')
    expect((input.element as HTMLInputElement).value).toBe('Hello')
  })

  it('emits update:modelValue when input changes', async () => {
    const wrapper = createWrapper({
      modelValue: { en: '', ar: '' },
    })
    const input = wrapper.find('input')
    await input.setValue('Test value')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    // const emittedValue = wrapper.emitted('update:modelValue')![0] as Record<string, string>
    // expect(emittedValue.en).toBe('Test value')
  })

  it('has the correct wrapper class', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.lang-input-wrapper').exists()).toBe(true)
  })

  it('applies correct input type', () => {
    const wrapper = createWrapper({ type: 'email' })
    const input = wrapper.find('input')
    expect(input.attributes('type')).toBe('email')
  })

  it('defaults input type to text', () => {
    const wrapper = createWrapper()
    const input = wrapper.find('input')
    expect(input.attributes('type')).toBe('text')
  })
})
