import {defineStore} from "pinia";
import {reactive} from "vue";

const useBlocksStore = defineStore('blocksStore', () => {

    const activeBlock = reactive<Record<string, string>>({
        hints: 'list',
        advices: 'list',
        projects: 'list',
        textbooks: 'list'
    })

    const resetStore = () => {
        activeBlock.hints = 'list'
        activeBlock.advices = 'list'
        activeBlock.projects = 'list'
        activeBlock.textbooks = 'list'
    }

    return {
        activeBlock,

        resetStore,
    }
})

export default useBlocksStore;