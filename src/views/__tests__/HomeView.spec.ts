import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from '../HomeView.vue'
import { createPinia, setActivePinia } from 'pinia'

//-----------------------------------------------------

describe('Home view', () => {
  let wrapper: any
  beforeEach(async () => {
    setActivePinia(createPinia())
    wrapper = mount(HomeView)
  })

  it('Check the labels', () => {
    expect(HomeView).toBeTruthy()
    expect(wrapper.find('h1').text()).toBe('Quick Quiz')
    expect(wrapper.find('.start-btn').text()).toBe('Start quiz')
  })

  it('Check if the spinner exists', async () => {
    await wrapper.find('.start-btn').trigger('click')
    expect(wrapper.find('.v-spinner')).exist
  })

})
