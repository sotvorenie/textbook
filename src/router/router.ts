import { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Auth',
        component: () => import('../pages/Auth.vue')
    },
    {
        path: '/main',
        name: 'Main',
        component: () => import('../pages/Home.vue')
    }
]