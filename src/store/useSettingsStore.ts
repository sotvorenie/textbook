import {defineStore} from "pinia";
import {reactive} from "vue";


const useSettingsStore = defineStore('settingsStore', () => {

    const settingsVisible = reactive<Record<string, string>>({
        hints: 'list',
        advices: 'list',
        projects: 'list',
        textbooks: 'list'
    })

    const resetStore = () => {
        settingsVisible.hints = 'list'
        settingsVisible.advices = 'list'
        settingsVisible.projects = 'list'
        settingsVisible.textbooks = 'list'
    }

    return {
        settingsVisible,

        resetStore,
    }
})

export default useSettingsStore;