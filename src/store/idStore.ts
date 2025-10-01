import {defineStore} from "pinia";
import {reactive} from "vue";

const useIdStore = defineStore('idStore', () => {

    const idValues = reactive<Record<string, number>>({
        hints: 0,
        advices: 0,
        projects: 0,
        textbooks: 0
    })

    return {
        idValues
    }
})

export default useIdStore;