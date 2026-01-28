import {defineStore} from "pinia";
import {reactive, ref} from "vue";
import {List} from "../types/list.ts";
import {Meta} from "../types/meta.ts";

const useItemsStore = defineStore('itemsStore', () => {

    const items = reactive<Record<string, List[]>>({
        hints: [],
        advices: [],
        projects: [],
        textbooks: [],
    })

    const meta = ref<Record<string, Meta>>({
        hints: {
            total_items: 0,
            total_pages: 0,
            current_page: 1,
            per_page: 0,
            remaining_count: 0,
        },
        advices: {
            total_items: 0,
            total_pages: 0,
            current_page: 1,
            per_page: 0,
            remaining_count: 0,
        },
        projects: {
            total_items: 0,
            total_pages: 0,
            current_page: 1,
            per_page: 0,
            remaining_count: 0,
        },
        textbooks: {
            total_items: 0,
            total_pages: 0,
            current_page: 1,
            per_page: 0,
            remaining_count: 0,
        },
    })

    const resetMeta = (name: string): void => {
        meta.value[name] = {
            total_items: 0,
            total_pages: 0,
            current_page: 1,
            per_page: 0,
            remaining_count: 0,
        }
    }

    const resetStore = () => {
        items.hints = []
        items.advices = []
        items.projects = []
        items.textbooks = []

        const sectionNames: string[] = ['hints', 'advices', 'projects', 'textbooks']
        sectionNames.forEach((name: string) => {
            meta.value[name] = {
                total_items: 0,
                total_pages: 0,
                current_page: 1,
                per_page: 0,
                remaining_count: 0,
            }
        })
    }

    return {
        items,
        meta,

        resetMeta,

        resetStore
    }
})

export default useItemsStore;