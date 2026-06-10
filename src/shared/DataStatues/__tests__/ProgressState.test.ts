import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProgressState from '../ProgressState.vue'

const createWrapper = (props = {}) =>
  mount(ProgressState, {
    props: {
      progress: 50,
      ...props,
    },
  })

describe('ProgressState', () => {
  it('renders without crashing', () => {
    const wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
  })

  it('has the correct root class', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.progress-state').exists()).toBe(true)
  })

  it('shows progress bar when not complete', () => {
    const wrapper = createWrapper({ progress: 50 })
    expect(wrapper.find('.progress-bar-container').exists()).toBe(true)
  })

  it('shows checkmark circle when complete (100%)', () => {
    const wrapper = createWrapper({ progress: 100 })
    expect(wrapper.find('.progress-circle').exists()).toBe(true)
    expect(wrapper.find('.progress-bar-container').exists()).toBe(false)
  })

  it('displays percentage by default', () => {
    const wrapper = createWrapper({ progress: 75 })
    expect(wrapper.find('.progress-percentage').text()).toBe('75%')
  })

  it('hides percentage when showPercentage is false', () => {
    const wrapper = createWrapper({ progress: 50, showPercentage: false })
    expect(wrapper.find('.progress-percentage').exists()).toBe(false)
  })

  it('normalizes progress to 0-100 range', () => {
    const wrapper = createWrapper({ progress: 150 })
    // Should cap at 100 and show complete
    expect(wrapper.find('.progress-circle').exists()).toBe(true)
  })

  it('normalizes negative progress to 0', () => {
    const wrapper = createWrapper({ progress: -10 })
    expect(wrapper.find('.progress-percentage').text()).toBe('0%')
  })

  it('shows custom message', () => {
    const wrapper = createWrapper({ progress: 50, message: 'Uploading...' })
    expect(wrapper.find('.progress-message').text()).toBe('Uploading...')
  })

  it('shows complete message when done', () => {
    const wrapper = createWrapper({ progress: 100 })
    expect(wrapper.find('.complete-message').text()).toBe('Complete!')
  })

  it('shows custom complete message', () => {
    const wrapper = createWrapper({ progress: 100, message: 'Upload done!' })
    expect(wrapper.find('.complete-message').text()).toBe('Upload done!')
  })

  it('shows bytes when showBytes is true and loaded is provided', () => {
    const wrapper = createWrapper({
      progress: 50,
      showBytes: true,
      loaded: 512000,
      total: 1024000,
      showPercentage: false,
    })
    expect(wrapper.find('.progress-bytes').text()).toContain('500.0 KB')
  })

  it('applies custom color', () => {
    const wrapper = createWrapper({ progress: 50, color: '#ff0000' })
    const fill = wrapper.find('.progress-fill')
    expect(fill.attributes('style')).toContain('background-color: rgb(255, 0, 0)')
  })

  it('adds is-complete class when progress >= 100', () => {
    const wrapper = createWrapper({ progress: 100 })
    expect(wrapper.find('.is-complete').exists()).toBe(true)
  })
})
