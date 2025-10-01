import {defineStore} from "pinia";
import {reactive} from "vue";

const useBlocksStore = defineStore('blocksStore', () => {

    const activeBlock = reactive<Record<string, string>>({
        hints: 'list',
        advices: 'list',
        projects: 'list',
        textbooks: 'list'
    })

    return {
        activeBlock
    }
})

export default useBlocksStore;