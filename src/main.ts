import '@/assets/style/main.scss'
import '@/assets/style/github-light-theme.scss' // GitHub Light 테마

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import BootstrapVueNext from 'bootstrap-vue-next'

// Bootstrap JavaScript 추가 (드롭다운 등의 기능을 위해)
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import { library, config } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Font Awesome CSS 스타일 추가 (Vue 컴포넌트 아이콘 표시용)
import '@fortawesome/fontawesome-svg-core/styles.css'

// Font Awesome 자동 CSS 추가 비활성화 (Vue 컴포넌트만 사용)
config.autoAddCss = false

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
