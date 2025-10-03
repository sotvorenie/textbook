import {defineStore} from "pinia";
import {reactive} from "vue";

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
    })

    const resetStore = () => {
        scrolls.hints.list = 0
        scrolls.hints.item = 0
        scrolls.hints.create = 0

        scrolls.textbooks.list = 0
        scrolls.textbooks.item = 0
        scrolls.textbooks.create = 0
    }

    return {
        scrolls,

        resetStore,
    }
})

export default useScrollStore;