import useBlocksStore from "../store/blocksStore.ts";
import useIdStore from "../store/idStore.ts";
import useItemMemoStore from "../store/itemMemoStore.ts";
import useSearchStore from "../store/searchStore.ts";
import useSettingsStore from "../store/settingsStore.ts";
import useTechnologiesStore from "../store/technologiesStore.ts";
import useUserStore from "../store/userStore.ts";
import useScrollStore from "../store/useScrollStore.ts";
import useCreateStore from "../store/useCreateStore.ts";
import useItemsStore from "../store/useItemsStore.ts";

export const resetAllStores = (): void => {
    const userStore = useUserStore();
    const blocksStore = useBlocksStore();
    const idStore = useIdStore();
    const itemMemoStore = useItemMemoStore();
    const searchStore = useSearchStore();
    const settingsStore = useSettingsStore();
    const technologiesStore = useTechnologiesStore();
    const scrollStore = useScrollStore();
    const createStore = useCreateStore();
    const createdDeletedItemStore = useItemsStore();

    userStore.resetStore();
    blocksStore.resetStore();
    idStore.resetStore();
    itemMemoStore.resetStore();
    searchStore.resetStore();
    settingsStore.resetStore();
    technologiesStore.resetStore();
    scrollStore.resetStore();
    createStore.resetStore();
    createdDeletedItemStore.resetStore();
};