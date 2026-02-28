import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PostView from '@/views/PostView.vue'
import PostDetailView from '@/views/PostDetailView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/post',
            name: 'post',
            component: PostView,
            props: true
        },
        {
            path: '/post/:id',
            name: 'postDetail',
            component: PostDetailView,
            props: true
        }
    ]
})

export default router
