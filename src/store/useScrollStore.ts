import {defineStore} from "pinia";
import {nextTick, reactive, watch} from "vue";
import {debounce} from "../utils/debounce.ts";

const useScrollStore = defineStore('scrollStore', () => {

    const scrolls = reactive<Record<string, Record<string, number>>>({
        hints: {
            list: 0,
            item: 0,
            create: 0,
        },
        textbooks: {
            list: 0,
            item: 0,
            create: 0,
        },
        projects: {
            list: 0,
            item: 0,
            create: 0,
        },
        advices: {
            list: 0,
            item: 0,
            create: 0,
        },
    })

    const useSaveScroll = (pageName: string, blockName: string) => {
        const getMainElement = () =>
            document.querySelector('.home__main') as HTMLDivElement

        const saveScroll = () => {
            const mainElement = getMainElement()
            if (!mainElement) return

            scrolls[pageName][blockName] = mainElement.scrollTop
        }

        const debouncedSaveScroll = debounce(saveScroll, 200)

        const setup = () => {
            const mainElement = getMainElement()
            if (!mainElement) return

            mainElement.addEventListener('scroll', debouncedSaveScroll)
        }

        const clearItem = () => {
            scrolls[pageName].item = 0
        }

        const clearCreate = () => {
            scrolls[pageName].create = 0
        }

        const destroy = () => {
            const mainElement = getMainElement()
            if (!mainElement) return

            mainElement.removeEventListener('scroll', debouncedSaveScroll)
        }

        const restoreScroll = async () => {
            await nextTick()

            const mainElement = getMainElement()
            if (!mainElement) return

            mainElement.scrollTop = scrolls[pageName][blockName]
        }

        watch(
            () => blockName,
            async (val, oldVal) => {
                if (val === 'list' && oldVal === 'item') {
                    await restoreScroll()
                    clearItem()
                }

                if (val === 'item' && oldVal === 'create') {
                    await restoreScroll()
                    clearCreate()
                }

                if (val === 'item' && oldVal === 'list') {
                    await restoreScroll()
                }
            }
        )

        return {
            setup,
            destroy,
            saveScroll,
            restoreScroll,
        }
    }

    const resetStore = () => {
        scrolls.hints.list = 0
        scrolls.hints.item = 0
        scrolls.hints.create = 0

        scrolls.textbooks.list = 0
        scrolls.textbooks.item = 0
        scrolls.textbooks.create = 0

        scrolls.projects.list = 0
        scrolls.projects.item = 0
        scrolls.projects.create = 0

        scrolls.advices.list = 0
        scrolls.advices.item = 0
        scrolls.advices.create = 0
    }

    return {
        scrolls,

        useSaveScroll,
        resetStore,
    }
})

export default useScrollStore;