import {defineStore} from "pinia";
import {ref} from "vue";

const useTechnologiesStore = defineStore('technologiesStore', () => {

    const technologies = ref<{
        id: number,
        name: string,
    }[]>([])

    const resetStore = () => {
        technologies.value = []
    }

    return {
        technologies,

        resetStore,
    }
})

export default useTechnologiesStore;