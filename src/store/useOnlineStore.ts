import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {UnAuthorizedList} from "../types/list.ts";
import {selectSQL} from "../api/database.ts";
import useUserStore from "./userStore.ts";

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

    // несинхронизированные элементы
    const offlinePosts = ref<UnAuthorizedList[]>([])

    // проверка: есть ли несинхронизированные данные (и можем ли мы их синхроонизировать (админ мы или нет))
    const visibleUnSync = computed(() => {
        const userStore = useUserStore()

        const check = offlinePosts.value?.length || 0
        return Boolean(check) && isOnlineMode.value && userStore.isAdmin
    })

    // получаем все несинхронизированные записи
    const getOfflinePosts = async () => {
        const tablesNames = ['advices', 'projects', 'posts', 'textbooks']

        offlinePosts.value = []

        for (const tableName of tablesNames) {
            const items =
                await selectSQL<UnAuthorizedList>(`SELECT * FROM ${tableName} WHERE offline != ''`)

            items.forEach(item => offlinePosts.value.push(item))
        }
    }

    return {
        isOnlineMode,
        isOnline,

        offlinePosts,

        visibleUnSync,
        getOfflinePosts,

        changeMode,
        getFromLocalStorage,
        setToLocalStorage,
    }
})

export default useOnlineStore