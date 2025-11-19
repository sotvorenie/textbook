import {defineStore} from "pinia";
import {ref, watch} from "vue";
import router from "../router";

import {User} from "../types/user";

import {getCurrentDateTime} from "../composables/useDate.ts";
import {showError} from "../utils/modals.ts";
import {userAva} from "../utils/ava.ts";
import {resetAllStores} from "../utils/resetAllStores.ts";

import {check} from "../api/auth/auth.ts";
import {get} from "../api/base.ts";
import {getAva, getLastSession, setLastSession} from "../api/users/users.ts";
import {sendToTelegram, TelegramEventType} from "../api/telegram/telegram.ts";

import useOnlineStore from "./useOnlineStore.ts";
import useUserStore from "./userStore.ts";
import useTechnologiesStore from "./technologiesStore.ts";

const useHomeStore = defineStore('homeStore', () => {
    const onlineStore = useOnlineStore();


    // видимость анимации на HomePage
    const loadingVisible = ref<boolean>(true)

    const activeMenuIndex = ref<number>(0)

    // функция при инициализации HomePage
    const loadInfo = async (isFirstRender: boolean = false) => {
        const userStore = useUserStore()
        const technologiesStore = useTechnologiesStore()

        onlineStore.modeLoadingVisible = true
        activeMenuIndex.value = 0

        resetAllStores()

        onlineStore.isOnline = navigator.onLine

        if (!onlineStore.isOnline) {
            onlineStore.isOnlineMode = false
            loadingVisible.value = false
            onlineStore.modeLoadingVisible = false
            return
        } else {
            if (isFirstRender) onlineStore.getFromLocalStorage()

            if (!onlineStore.isOnlineMode) {
                loadingVisible.value = false
                onlineStore.modeLoadingVisible = false
                userStore.user.ava = {url: '', id: -1}
                return
            }
        }

        const checkUser = async () => {
            try {
                const user = await check();
                userStore.setUser(user as User);
            } catch (err: any) {
                if (err.message === 'NO_TOKEN') {
                    loadingVisible.value = false
                    await router.push('/')
                    return
                }

                if (err.message === 'OFFLINE') {
                    await showError(
                        'Ошибка авторизации',
                        'Приложение переключено в оффлайн режим'
                    )
                    onlineStore.isOnline = false
                    onlineStore.isOnlineMode = false
                    loadingVisible.value = false
                    return
                }

                loadingVisible.value = false
                await router.push('/')
                return
            }
        }
        await checkUser()

        const getAdmins = async () => {
            try {
                const response: {id:number, full: boolean, viewer: boolean}[] =
                    await get(`/admins?id=${userStore.user.id}`);

                let user
                if (response?.length) {
                    user = response[0]
                }

                userStore.isAdmin = !!user;
                userStore.isFullAdmin = user?.full ?? false
                userStore.isViewer = user?.viewer ?? false
            } catch (_) {
                await showError(
                    'Ошибка получения статуса',
                    'Не удалось получить статус пользователя'
                )
            }
        }
        await getAdmins()

        const getTechnologies = async () => {
            try {
                const response: string[] = await get('/technologies');

                if (response) {
                    technologiesStore.technologies = response
                }
            } catch (_) {
                await showError(
                    'Ошибка получения языков и технологий',
                    'Не удалось получить список языков и технологий'
                )
            }
        }
        await getTechnologies()

        const getLiked = async () => {
            try {
                const response: any = await get(`/user_liked?user_id=${userStore.user.id}`);

                if (response?.length) {
                    userStore.userLiked = response[0];
                }
            } catch (_) {
                await showError(
                    'Ошибка получения избранных постов',
                    'Не удалось получить список избранных постов'
                )
            }
        }
        await getLiked()

        const getUserAvatar = async () => {
            try {
                const ava = userAva.get()
                if (!ava?.url) {
                    await getAva()
                } else {
                    userStore.user.ava = ava
                }
            } catch (_) {
                await showError(
                    'Ошибка загрузки аватара',
                    'Не удалось загрузить аватар пользователя'
                )
            }
        }
        await getUserAvatar()

        await getLastSession()
        await setLastSession()

        const date = getCurrentDateTime()
        if (date.date !== userStore.lastSession) {
            await sendToTelegram(TelegramEventType.NEW_SESSION)
        }

        // получаем несинхронизированные данные с бд
        await onlineStore.getOfflinePosts()

        onlineStore.modeLoadingVisible = false
        loadingVisible.value = false
    }

    watch(
        () => onlineStore.isOnlineMode,
        async () => {
            await loadInfo()
        }
    )

    return {
        loadingVisible,
        activeMenuIndex,

        loadInfo,
    }
})

export default useHomeStore