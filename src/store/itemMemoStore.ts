import {defineStore} from "pinia";
import {reactive} from "vue";
import {Item} from "../types/item.ts";

const useItemMemoStore = defineStore('itemMemoStore', () => {

    const items = reactive<Record<string, Map<number, Item>>>({
        hints: new Map(),
        advices: new Map(),
        projects: new Map(),
        textbooks: new Map(),
    })

    const getItem = (name: string, id: number): Item | undefined => {
        return items[name].get(id);
    }

    const setItem = (name: string, id: number, value: Item): void => {
        items[name].set(id, value);
    }

    const resetStore = () => {
        items.hints = new Map()
        items.advices = new Map()
        items.projects = new Map()
        items.textbooks = new Map()
    }

    return {
        items,

        getItem,
        setItem,

        resetStore,
    }
})

export default useItemMemoStore;