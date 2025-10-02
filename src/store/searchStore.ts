import {defineStore} from "pinia";
import {reactive} from "vue";

const useSearchStore = defineStore('searchStore', () => {

    const searchNames = reactive<Record<string, string>>({
        hints: '',
        advices: '',
        projects: '',
        textbooks: '',
    })

    const filterTechnologies = reactive<Record<string, string[]>>({
        hints: [],
        advices: [],
        projects: [],
        textbooks: [],
    })

    const myOtherFilter = reactive<Record<string, string>>({
        hints: 'all',
        advices: 'all',
        projects: 'all',
        textbooks: 'all',
    })

    const sortBy = reactive<Record<string, string>>({
        hints: '-sort_date',
        advices: '-sort_date',
        projects: '-sort_date',
        textbooks: '-sort_date',
    })

    const resetStore = () => {
        searchNames.hints = ''
        searchNames.advices = ''
        searchNames.projects = ''
        searchNames.textbooks = ''

        filterTechnologies.hints = []
        filterTechnologies.advices = []
        filterTechnologies.projects = []
        filterTechnologies.textbooks = []

        myOtherFilter.hints = 'all'
        myOtherFilter.advices = 'all'
        myOtherFilter.projects = 'all'
        myOtherFilter.textbooks = 'all'

        sortBy.hints = '-sort_date'
        sortBy.advices = '-sort_date'
        sortBy.projects = '-sort_date'
        sortBy.textbooks = '-sort_date'
    }

    return {
        searchNames,
        filterTechnologies,
        myOtherFilter,
        sortBy,

        resetStore,
    }
})

export default useSearchStore;