import { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
    {
        path: '/auth',
        name: 'Auth',
        component: () => import('../pages/Auth.vue')
    },
    {
        path: '/',
        component: () => import('../layouts/MainLayout.vue'),
        children: [
            {
                path: '',
                redirect: 'main',
            },
            {
                path: 'main',
                name: 'Main',
                component: () => import('../pages/Home.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: 'user/:id',
                name: 'User',
                component: () => import('../pages/User.vue'),
                meta: { requiresAuth: true },
                props: true,
            },
        ]
    },
]