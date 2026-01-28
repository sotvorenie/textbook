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
                path: 'main',
                name: 'Main',
                component: () => import('../pages/Main.vue'),
                meta: { section: 'main' }
            },
            {
                path: 'hints',
                name: 'Hints',
                component: () => import('../pages/sections/Hints/Hints.vue'),
                meta: { section: 'hints' }
            },
            {
                path: 'hints/:id',
                name: 'HintsItem',
                component: () => import('../pages/sections/Hints/HintsItem.vue'),
                props: true,
                meta: { section: 'hints' }
            },
            {
                path: 'hints/create',
                name: 'HintsCreate',
                component: () => import('../pages/sections/Hints/HintsCreate.vue'),
                meta: { section: 'hints' }
            },
            {
                path: 'textbooks',
                name: 'Textbooks',
                component: () => import('../pages/sections/Textbooks/Textbooks.vue'),
                meta: { section: 'textbooks' }
            },
            {
                path: 'textbooks/:id',
                name: 'TextbooksItem',
                component: () => import('../pages/sections/Textbooks/TextbooksItem.vue'),
                props: true,
                meta: { section: 'textbooks' }
            },
            {
                path: 'textbooks/create',
                name: 'TextbooksCreate',
                component: () => import('../pages/sections/Textbooks/TextbooksCreate.vue'),
                meta: { section: 'textbooks' }
            },
            {
                path: 'projects',
                name: 'Projects',
                component: () => import('../pages/sections/Projects/Projects.vue'),
                meta: { section: 'projects' }
            },
            {
                path: 'projects/:id',
                name: 'ProjectsItem',
                component: () => import('../pages/sections/Projects/ProjectsItem.vue'),
                props: true,
                meta: { section: 'projects' }
            },
            {
                path: 'projects/create',
                name: 'ProjectsCreate',
                component: () => import('../pages/sections/Projects/ProjectsCreate.vue'),
                meta: { section: 'projects' }
            },
            {
                path: 'advices',
                name: 'Advices',
                component: () => import('../pages/sections/Advices/Advices.vue'),
                meta: { section: 'advices' }
            },
            {
                path: 'advices/:id',
                name: 'AdvicesItem',
                component: () => import('../pages/sections/Advices/AdvicesItem.vue'),
                props: true,
                meta: { section: 'advices' }
            },
            {
                path: 'advices/create',
                name: 'AdvicesCreate',
                component: () => import('../pages/sections/Advices/AdvicesCreate.vue'),
                meta: { section: 'advices' }
            },
            {
                path: 'messenger',
                name: 'Messenger',
                component: () => import('../pages/sections/Messenger/Messenger.vue')
            },
            {
                path: 'blog',
                name: 'Blog',
                component: () => import('../pages/sections/Blog/Blog.vue')
            },
            {
                path: 'about',
                name: 'About',
                component: () => import('../pages/About.vue')
            },
            {
                path: 'user/:id',
                name: 'User',
                component: () => import('../pages/User.vue'),
                meta: { section: 'user' },
                props: true,
            },
        ]
    },
]