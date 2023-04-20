import { createApp } from 'vue'
import App from './App.vue'
import router from './routers'
import './assets/main.css'
import pinia from '@/stores'

const app = createApp(App)

app.use(router).use(pinia)

app.mount('#app')
