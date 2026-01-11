import {defineStore} from "pinia";
import {reactive} from "vue";

const useIdStore = defineStore('idStore', () => {

    const idValues = reactive<Record<string, number>>({
        hints: 0,
        advices: 0,
        projects: 0,
        textbooks: 0
    })

    // на каком id элемента был пользователь до того как перешел на страницу автора (он был на id = 1, потом перешел на автора, с него перешел на его статью с id = 3, потом захотел вернуться назад и при выходе со страницы автора чтобы попадал на элемент с id = 1(как и было изначально))
    const oldIdValues = reactive<Record<string, number>>({
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
        oldIdValues,

        resetStore,
    }
})

export default useIdStore;