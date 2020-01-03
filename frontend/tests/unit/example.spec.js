import { shallowMount } from '@vue/test-utils'
import app from '@/App.vue'

describe('App.vue', () => {
  it('is a Vue instance', () => {
    const wrapper = shallowMount(app)
    expect(wrapper.isVueInstance()).toBeTruthy()
  })
})
