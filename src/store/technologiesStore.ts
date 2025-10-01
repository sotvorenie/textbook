import {defineStore} from "pinia";
import {ref} from "vue";

const useTechnologiesStore = defineStore('technologiesStore', () => {

    const technologies = ref<string[]>([])

    return {
        technologies,
    }
})

export default useTechnologiesStore;