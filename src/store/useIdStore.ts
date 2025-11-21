import {defineStore} from "pinia";
import {reactive} from "vue";

const useIdStore = defineStore('idStore', () => {

    const idValues = reactive<Record<string, number>>({
        hints: 0,
        advices: 0,
        projects: 0,
        textbooks: 0
    })

    const resetStore = () => {
        idValues.hints = 0
        idValues.advices = 0
        idValues.projects = 0
        idValues.textbooks = 0
    }

    return {
        idValues,

        resetStore,
    }
})

export default useIdStore;