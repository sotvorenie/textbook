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
    }

    return {
        createData,

        resetStore,
    }
})

export default useCreateStore;