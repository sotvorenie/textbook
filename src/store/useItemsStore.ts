import {defineStore} from "pinia";
import {reactive} from "vue";
import {List} from "../types/list.ts";

const useItemsStore = defineStore('itemsStore', () => {

    const items = reactive<Record<string, List[]>>({
        hints: [],
        advices: [],
        projects: [],
        textbooks: [],
    })

    const resetStore = () => {
        items.hints = []
        items.advices = []
        items.projects = []
        items.textbooks = []
    }

    return {
        items,

        resetStore
    }
})

export default useItemsStore;