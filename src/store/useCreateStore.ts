import {defineStore} from "pinia";
import {reactive, ref} from "vue";

const useCreateStore = defineStore('createStore', () => {

    const createData = reactive<Record<string, {
        title: string,
        text?: string,
        id: number,
        languages_and_technologies: string[],
        date: string,
        sort_date: string,
        time: string,
        content?: Record<string, string>
    }>>({
        hints: {
            title: '',
            text: '',
            id: -1,
            languages_and_technologies: [],
            date: '',
            sort_date: '',
            time: '',
        },
        advices: {
            title: '',
            text: '',
            id: -1,
            languages_and_technologies: [],
            date: '',
            sort_date: '',
            time: '',
        },
        projects: {
            title: '',
            text: '',
            id: -1,
            languages_and_technologies: [],
            date: '',
            sort_date: '',
            time: '',
        },
        textbooks: {
            title: '',
            content: {},
            id: -1,
            languages_and_technologies: [],
            date: '',
            sort_date: '',
            time: '',
        },
    })

    const draft = ref<Record<string, any>>({})

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
            date: '',
            sort_date: '',
            time: '',
        }
        createData.advices = {
            title: '',
            text: '',
            id: -1,
            languages_and_technologies: [],
            date: '',
            sort_date: '',
            time: '',
        }
        createData.projects = {
            title: '',
            text: '',
            id: -1,
            languages_and_technologies: [],
            date: '',
            sort_date: '',
            time: '',
        }
        createData.textbooks = {
            title: '',
            content: {},
            id: -1,
            languages_and_technologies: [],
            date: '',
            sort_date: '',
            time: '',
        }

        draft.value = {}

        isRedact.hints = false
        isRedact.advices = false
        isRedact.projects = false
        isRedact.textbooks = false
    }

    return {
        createData,
        draft,
        isRedact,

        resetStore,
    }
})

export default useCreateStore;