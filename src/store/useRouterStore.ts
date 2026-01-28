import {defineStore} from "pinia";
import {reactive} from "vue";
import {RouteLocationNormalized} from "vue-router";

const useRouterStore = defineStore("routerStore", () => {

    // маршруты для каждого из разделов
    const sectionRoutes = reactive<Record<string, RouteLocationNormalized[]>>({})

    const pushSectionRoute = (
        section: string,
        route: RouteLocationNormalized,
        from?: RouteLocationNormalized
    ) => {
        if (!sectionRoutes[section]) sectionRoutes[section] = []

        const last = sectionRoutes[section].at(-1)
        if (last?.fullPath === route.fullPath) return

        if (route.name === 'User' && from?.name?.toString().endsWith('Item')) {
            const itemSection = from.meta.section as string
            if (!sectionRoutes[itemSection]) sectionRoutes[itemSection] = []
            sectionRoutes[itemSection].push(route)

            return
        }

        sectionRoutes[section].push(route)
    }


    const clearSection = (section: string) => {
        sectionRoutes[section] = []
    }

    const resetStore = () => {
        Object.keys(sectionRoutes).forEach(key => {
            delete sectionRoutes[key]
        })
    }

    return {
        sectionRoutes,

        pushSectionRoute,
        clearSection,

        resetStore
    }
})

export default useRouterStore