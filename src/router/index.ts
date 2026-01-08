import {createRouter, createWebHistory} from 'vue-router'
import { routes } from './router'
import {authToken} from "../utils/auth.ts";

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(_to, _from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
})

router.beforeEach((to, from, next) => {
    const isAuthenticated = authToken.hasToken()  // проверка авторизации

    if (to.meta.requiresAuth && !isAuthenticated) {
        next({ name: 'Auth' })
        return
    }

    if (to.name === 'User' && !from.name) {
        next({ name: 'Main' })
        return
    }

    if (to.name === 'Auth' && isAuthenticated) {
        next({ name: 'Main' })
        return
    }

    next()
})


export default router