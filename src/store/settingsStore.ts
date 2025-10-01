import {defineStore} from "pinia";
import {reactive} from "vue";


const useSettingsStore = defineStore('settingsStore', () => {

    const settingsVisible = reactive<Record<string, string>>({
        hints: 'list',
        advices: 'list',
        projects: 'list',
        textbooks: 'list'
    })

    return {
        settingsVisible,
    }
})

export default useSettingsStore;