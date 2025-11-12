import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {UnAuthorizedList} from "../types/list.ts";
import {selectSQL} from "../api/database.ts";

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

    // несинхронизированные созданные элементы
    const createdPosts = ref<UnAuthorizedList[]>([])
    // несинхронизированные редактированные элементы
    const redactedPosts = ref<UnAuthorizedList[]>([])

    // проверка: есть ли несинхронизированные данные
    const visibleUnSync = computed(() => {
        const sum = (createdPosts.value?.length || 0) + (redactedPosts.value?.length || 0)
        return Boolean(sum)
    })

    // получаем все неавторизованные записи
    const getOfflinePosts = async () => {
        const tablesNames = ['advices', 'projects', 'posts', 'textbooks']

        createdPosts.value = []
        redactedPosts.value = []

        for (const tableName of tablesNames) {
            const items =
                await selectSQL<UnAuthorizedList>(`SELECT * FROM ${tableName} WHERE offline != ''`)

            items.forEach(item => {
                if (item.offline === 'create') {
                    createdPosts.value.push(item)
                } else if (item.offline === 'redact') {
                    redactedPosts.value.push(item)
                }
            })
        }
    }

    return {
        isOnlineMode,
        isOnline,

        createdPosts,
        redactedPosts,

        visibleUnSync,
        getOfflinePosts,

        changeMode,
        getFromLocalStorage,
        setToLocalStorage,
    }
})

export default useOnlineStore