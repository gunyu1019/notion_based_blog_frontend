import '@/assets/style/main.scss'
import '@/assets/style/github-light-theme.scss' // GitHub Light 테마

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import BootstrapVueNext from 'bootstrap-vue-next'

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// 모든 아이콘 라이브러리 추가 (Vue 컴포넌트 전용)
library.add(fas, fab, far)

import App from './App.vue'
import router from './router'
import axios from 'axios'
import VueAxios from 'vue-axios'

const app = createApp(App)

app.use(createPinia())
app.use(VueAxios, axios)
app.use(router)
app.use(BootstrapVueNext)
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
