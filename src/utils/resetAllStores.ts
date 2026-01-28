import useItemMemoStore from "../store/useItemMemoStore.ts";
import useTechnologiesStore from "../store/useTechnologiesStore.ts";
import useUserStore from "../store/useUserStore.ts";
import useScrollStore from "../store/useScrollStore.ts";
import useCreateStore from "../store/useCreateStore.ts";
import useItemsStore from "../store/useItemsStore.ts";
import useIpStore from "../store/useIpStore.ts";
import useRouterStore from "../store/useRouterStore.ts";

export const resetAllStores = (): void => {
    const userStore = useUserStore();
    const itemMemoStore = useItemMemoStore();
    const technologiesStore = useTechnologiesStore();
    const scrollStore = useScrollStore();
    const createStore = useCreateStore();
    const createdDeletedItemStore = useItemsStore();
    const ipStore = useIpStore();
    const itemsStore = useItemsStore();
    const routerStore = useRouterStore();

    userStore.resetStore()
    itemMemoStore.resetStore()
    technologiesStore.resetStore()
    scrollStore.resetStore()
    createStore.resetStore()
    createdDeletedItemStore.resetStore()
    ipStore.resetStore()
    itemsStore.resetStore()
    routerStore.resetStore()
}