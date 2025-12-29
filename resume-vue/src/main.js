import './assets/index.css'
import './assets/builder.css'
import 'remixicon/fonts/remixicon.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
