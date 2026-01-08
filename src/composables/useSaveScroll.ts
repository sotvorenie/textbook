import {debounce} from "../utils/debounce.ts";
import {nextTick, watch} from "vue";

import useScrollStore from "../store/useScrollStore.ts";
import useBlocksStore from "../store/useBlocksStore.ts";

export const useSaveScroll = (pageName: string) => {
    const scrollStore = useScrollStore();
    const blocksStore = useBlocksStore();

    const getMainElement = () =>
        document.querySelector('.home__main') as HTMLDivElement

    const saveScroll = () => {
        const mainElement = getMainElement()
        if (!mainElement) return

        scrollStore.scrolls[pageName][blocksStore.activeBlock[pageName]] = mainElement.scrollTop
    }

    const debouncedSaveScroll = debounce(saveScroll, 200)

    const setup = () => {
        const mainElement = getMainElement()
        if (!mainElement) return

        mainElement.addEventListener('scroll', debouncedSaveScroll)
    }

    const clearItem = () => {
        scrollStore.scrolls[pageName].item = 0
    }

    const clearCreate = () => {
        scrollStore.scrolls[pageName].create = 0
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

        mainElement.scrollTop = scrollStore.scrolls[pageName][blocksStore.activeBlock[pageName]]
    }

    watch(
        () => blocksStore.activeBlock[pageName],
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