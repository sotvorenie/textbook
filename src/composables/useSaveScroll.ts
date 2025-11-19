import { debounce } from "../utils/debounce.ts";
import { nextTick, watch } from "vue";

import useScrollStore from "../store/useScrollStore.ts";
import useBlocksStore from "../store/blocksStore.ts";

export const useSaveScroll = (pageName: string) => {
    const scrollStore = useScrollStore();
    const blocksStore = useBlocksStore();

    const mainElement =
        document.querySelector('.home__main') as HTMLDivElement;

    const saveScroll = () => {
        scrollStore.scrolls[pageName][blocksStore.activeBlock[pageName]] = mainElement.scrollTop;
    };

    const debouncedSaveScroll = debounce(saveScroll, 200);

    const setup = () => {
        mainElement.addEventListener('scroll', debouncedSaveScroll);

        watch(() => blocksStore.activeBlock[pageName], async () => {
            await nextTick(() => {
                const savedPosition =
                    scrollStore.scrolls[pageName][blocksStore.activeBlock[pageName]];
                if (savedPosition > 0) {
                    mainElement.scrollTop = savedPosition;
                }
            })
        });
    };

    const destroy = () => {
        mainElement.removeEventListener('scroll', debouncedSaveScroll);
    };

    return {
        setup,
        destroy,
        saveScroll,
        restoreScroll: async () => {
            await nextTick(() => {
                const savedPosition =
                    scrollStore.scrolls[pageName][blocksStore.activeBlock[pageName]];
                if (savedPosition > 0) {
                    mainElement.scrollTop = savedPosition;
                }
            });
        }
    };
};