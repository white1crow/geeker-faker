import { defineStore, createPinia } from 'pinia'
import { GlobalState } from './interface'

export const GlobalStore = defineStore({
  id: 'GlobalStore',
  state: (): GlobalState => {
    return {
      token: ''
    }
  },
  actions: {
    setToken(token: string) {
      this.token = token
    }
  }
})

const pinia = createPinia()

export default pinia
