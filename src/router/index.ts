import {createRouter, createWebHistory} from 'vue-router'
import { routes } from './router'
import useRouterStore from "../store/useRouterStore.ts";

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

router.beforeEach((to, from) => {
    const routerStore = useRouterStore()

    if (!from.name && to.name !== 'Auth' && to.name !== 'Main') {
        return { name: 'Main' }
    }

    const section = to.meta.section as string | undefined
    if (section) {
        routerStore.pushSectionRoute(section, to, from)
    }
})


export default router