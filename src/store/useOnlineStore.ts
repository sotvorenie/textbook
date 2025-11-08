import {defineStore} from "pinia";
import {ref} from "vue";

const useOnlineStore = defineStore("onlineStore", () => {
    // режим приложения
    const isOnlineMode = ref(true)

    // есть ли доступ к интернету
    const isOnline = ref<boolean>(true)

    // изменение режима приложения
    const changeMode = () => {
        isOnlineMode.value = !isOnlineMode.value

        setToLocalStorage()
    }

    // получить данные из localStorage
    const getFromLocalStorage = (): void => {
        isOnlineMode.value = JSON.parse(localStorage.getItem("online") ?? 'true')
    }

    // записать данные в localStorage
    const setToLocalStorage = (): void => {
        localStorage.setItem("online", JSON.stringify(isOnlineMode.value))
    }

    return {
        isOnlineMode,
        isOnline,

        changeMode,
        getFromLocalStorage,
        setToLocalStorage,
    }
})

export default useOnlineStore