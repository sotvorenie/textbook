import {defineStore} from "pinia";
import {ref} from "vue";

const useUIStore = defineStore('uiStore', () => {
    //=========================================================//
    //-- новогодний ui --//
    // видимость новогодний элементов
    const winterUiVisible = ref<boolean>(false)

    // видимость снега
    const snowVisible = ref<boolean>(true)
    // видимость гирлянды
    const garlandVisible = ref<boolean>(true)
    // включена ли гирлянда
    const garlandIsActive = ref<boolean>(true)

    // задаем видимость новогодних ui элементов
    const setWinterUiVisible = () => {
        const month = new Date().getMonth() + 1

        winterUiVisible.value = month === 12 || month < 3
    }
    //=========================================================//

    return {
        winterUiVisible,

        snowVisible,
        garlandVisible,
        garlandIsActive,

        setWinterUiVisible
    }
})

export default useUIStore;