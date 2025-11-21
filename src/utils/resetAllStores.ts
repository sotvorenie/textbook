import useBlocksStore from "../store/useBlocksStore.ts";
import useIdStore from "../store/useIdStore.ts";
import useItemMemoStore from "../store/useItemMemoStore.ts";
import useSearchStore from "../store/useSearchStore.ts";
import useSettingsStore from "../store/useSettingsStore.ts";
import useTechnologiesStore from "../store/useTechnologiesStore.ts";
import useUserStore from "../store/useUserStore.ts";
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