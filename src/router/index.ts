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

router.beforeEach((to, _from, next) => {
    const isAuthenticated = authToken.hasToken();

    if (to.name === 'Auth' && isAuthenticated) {
        //если уже авторизован и пытается перейти на страницу авторизации
        next({ name: 'Main' })
    } else if (to.meta.requiresAuth && !isAuthenticated) {
        //если требуется авторизация, но пользователь не авторизован
        next({ name: 'Auth' })
    } else {
        //во всех остальных случаях разрешаем навигацию
        next()
    }
})

export default router