import {defineStore} from "pinia";
import {reactive} from "vue";

const useCreateStore = defineStore('createStore', () => {

    const createData = reactive<Record<string, {
        title: string,
        text: string,
        id: number,
    }>>({
        hints: {
            title: '',
            text: '',
            id: -1,
        },
        advices: {
            title: '',
            text: '',
            id: -1,
        },
        projects: {
            title: '',
            text: '',
            id: -1,
        },
        textbooks: {
            title: '',
            text: '',
            id: -1,
        },
    })

    const resetStore = () => {
        createData.hints = {
            title: '',
            text: '',
            id: -1,
        }
        createData.advices = {
            title: '',
            text: '',
            id: -1,
        }
        createData.projects = {
            title: '',
            text: '',
            id: -1,
        }
        createData.textbooks = {
            title: '',
            text: '',
            id: -1,
        }
    }

    return {
        createData,

        resetStore,
    }
})

export default useCreateStore;