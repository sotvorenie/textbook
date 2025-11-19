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

    // загрузилась ли у нас бд
    const isDBActive = ref<boolean>(true)

    // видимость анимации загрузки в кнопке переключения режимов приложения
    const modeLoadingVisible = ref<boolean>(false)

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

    // проверка: есть ли несинхронизированные данные (и можем ли мы их синхронизировать (админ мы или нет))
    const visibleUnSync = computed(() => {
        const userStore = useUserStore()

        const check = offlinePosts.value?.length || 0
        return Boolean(check) && isOnlineMode.value && userStore.isAdmin
    })

    // получаем все несинхронизированные записи
    const getOfflinePosts = async () => {
        const tablesNames = ['advices', 'projects', 'posts', 'textbooks']
        const userStore = useUserStore()

        offlinePosts.value = []

        try {
            for (const tableName of tablesNames) {
                const items = await selectSQL<UnAuthorizedList>(
                    `SELECT 
                            id,
                            title,
                            date,
                            languages_and_technologies,
                            offline,
                            block_name,
                            user_id
                          FROM ${tableName} WHERE offline != ''`
                );

                for (const item of items) {
                    if (hasAccessToOfflinePost(userStore, item)) {
                        offlinePosts.value.push(item);
                    }
                }
            }
        } catch (err) {
            return
        }
    }

    // проверка: вносить ли несинхронизированный элемент в список для синхронизации
    const hasAccessToOfflinePost = (userStore: any, item: any): boolean => {
        const isTextbook = item.block_name === 'textbooks';
        const isRedact = item.offline === 'redact';

        if (isTextbook) {
            if (isRedact) {
                return userStore.isFullAdmin && item.user_id === userStore.user.id;
            }
            return userStore.isFullAdmin;
        }

        if (isRedact) {
            return userStore.isAdmin && item.user_id === userStore.user.id;
        }
        return userStore.isAdmin;
    }

    return {
        isOnlineMode,
        isOnline,
        isDBActive,

        modeLoadingVisible,

        offlinePosts,

        visibleUnSync,
        getOfflinePosts,

        changeMode,
        getFromLocalStorage,
        setToLocalStorage,
    }
})

export default useOnlineStore