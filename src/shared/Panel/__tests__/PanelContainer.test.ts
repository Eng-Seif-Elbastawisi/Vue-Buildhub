import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PanelContainer from '../PanelContainer.vue'

describe('PanelContainer', () => {
  it('renders without crashing', () => {
    const wrapper = mount(PanelContainer)
    expect(wrapper.exists()).toBe(true)
  })

  it('has the panel-container class', () => {
    const wrapper = mount(PanelContainer)
    expect(wrapper.find('.panel-container').exists()).toBe(true)
  })

  it('renders slot content', () => {
    const wrapper = mount(PanelContainer, {
      slots: {
        default: '<p class="test-content">Hello World</p>',
      },
    })
    expect(wrapper.find('.test-content').exists()).toBe(true)
    expect(wrapper.text()).toContain('Hello World')
  })

  it('renders multiple children via slot', () => {
    const wrapper = mount(PanelContainer, {
      slots: {
        default: '<div>Child 1</div><div>Child 2</div>',
      },
    })
    expect(wrapper.text()).toContain('Child 1')
    expect(wrapper.text()).toContain('Child 2')
  })

  it('wraps content in a div', () => {
    const wrapper = mount(PanelContainer)
    expect(wrapper.element.tagName).toBe('DIV')
  })
})
