import {defineStore} from "pinia";
import {reactive} from "vue";

const useCreateStore = defineStore('createStore', () => {

    const createData = reactive<Record<string, {
        title: string,
        text: string,
        id: number,
        languages_and_technologies: string[],
        content?: Record<string, string>
    }>>({
        hints: {
            title: '',
            text: '',
            id: -1,
            languages_and_technologies: [],
        },
        advices: {
            title: '',
            text: '',
            id: -1,
            languages_and_technologies: [],
        },
        projects: {
            title: '',
            text: '',
            id: -1,
            languages_and_technologies: [],
        },
        textbooks: {
            title: '',
            text: '',
            id: -1,
            languages_and_technologies: [],
        },
    })

    const isRedact = reactive<Record<string, boolean>>({
        hints: false,
        advices: false,
        projects: false,
        textbooks: false,
    })

    const resetStore = () => {
        createData.hints = {
            title: '',
            text: '',
            id: -1,
            languages_and_technologies: [],
        }
        createData.advices = {
            title: '',
            text: '',
            id: -1,
            languages_and_technologies: [],
        }
        createData.projects = {
            title: '',
            text: '',
            id: -1,
            languages_and_technologies: [],
        }
        createData.textbooks = {
            title: '',
            text: '',
            id: -1,
            languages_and_technologies: [],
        }

        isRedact.hints = false
        isRedact.advices = false
        isRedact.projects = false
        isRedact.textbooks = false
    }

    return {
        createData,
        isRedact,

        resetStore,
    }
})

export default useCreateStore;