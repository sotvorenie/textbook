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
import {setLastSession} from "../api/users/users.ts";
import {sendToTelegram, TelegramEventType} from "../api/telegram/telegram.ts";

import useOnlineStore from "./useOnlineStore.ts";
import useUserStore from "./useUserStore.ts";
import useTechnologiesStore from "./useTechnologiesStore.ts";
import useIpStore from "./useIpStore.ts";

const useHomeStore = defineStore('homeStore', () => {
    const onlineStore = useOnlineStore();

    // загрузился ли Home впервые (чтобы при возврате со страницы User не было обновления данных)
    const firstLoading = ref(true)

    // видимость анимации на HomePage
    const loadingVisible = ref<boolean>(true)

    // индекс активного aside-меню
    const activeMenuIndex = ref<number>(0)

    // значение page для апи в зависимости от разрешения экрана при onMounted в Home Page
    const pageNumberForAPI = ref<number>(9)

    // функция при инициализации HomePage (и при переключении режимов online/offline)
    const loadInfo = async (isFirstRender: boolean = false) => {
        const userStore = useUserStore()
        const technologiesStore = useTechnologiesStore()
        const ipStore = useIpStore()

        const hideLoading = () => {
            onlineStore.modeLoadingVisible = false
            loadingVisible.value = false
        }

        onlineStore.modeLoadingVisible = true
        activeMenuIndex.value = 0

        resetAllStores()

        onlineStore.isOnline = navigator.onLine

        if (!onlineStore.isOnline || ipStore.inBlackList) {
            onlineStore.isOnlineMode = false
            hideLoading()
            return
        }

        if (isFirstRender) onlineStore.getFromLocalStorage()

        if (!onlineStore.isOnlineMode) {
            userStore.user.ava = { url: '', id: -1 }
            hideLoading()
            return
        }

        await ipStore.checkIP()

        if (ipStore.inBlackList) {
            hideLoading()
            return
        }

        const checkUser = async () => {
            try {
                const user = await check()
                userStore.setUser(user as User)
                return true
            } catch (err: any) {
                if (err.message === 'NO_TOKEN') {
                    loadingVisible.value = false
                    await router.push('/auth')
                    return false
                }

                if (err.message === 'OFFLINE') {
                    await showError(
                        'Ошибка авторизации',
                        'Приложение переключено в оффлайн режим'
                    )
                    onlineStore.isOnline = false
                    onlineStore.isOnlineMode = false
                    loadingVisible.value = false
                    return false
                }

                loadingVisible.value = false
                await router.push('/auth')
                return false
            }
        }

        if (!(await checkUser())) {
            hideLoading()
            return
        }

        if (!onlineStore.isOnline || !onlineStore.isOnlineMode) {
            hideLoading()
            return
        }

        const getAdmins = async () => {
            try {
                const response: {id:number, full: boolean, viewer: boolean}[] =
                    await get(`/admins?id=${userStore.user.id}`)

                let user
                if (response?.length) {
                    user = response[0]
                }

                userStore.isAdmin = !!user
                userStore.isFullAdmin = user?.full ?? false
                userStore.isViewer = user?.viewer ?? false
            } catch (err) {
                console.error('Ошибка получения администраторов', err)

                await showError(
                    'Ошибка получения статуса',
                    'Не удалось получить статус пользователя'
                )
            }
        }
        await getAdmins()

        const getTechnologies = async () => {
            try {
                const response: string[] = await get('/technologies')

                if (response) {
                    technologiesStore.technologies = response
                }
            } catch (err) {
                console.error('Ошибка получения технологий', err)

                await showError(
                    'Ошибка получения языков и технологий',
                    'Не удалось получить список языков и технологий'
                )
            }
        }
        await getTechnologies()

        const getLiked = async () => {
            try {
                const response: any = await get(`/user_liked?user_id=${userStore.user.id}`)

                if (response?.length) {
                    userStore.userLiked = response[0]
                }
            } catch (err) {
                console.error('Ошибка получения избранного', err)

                await showError(
                    'Ошибка получения избранных постов',
                    'Не удалось получить список избранных постов'
                )
            }
        }
        await getLiked()

        const getUserAvatar = (response: string): string => {
            const ava = userAva.get()
            if (ava?.url) {
                userStore.user.ava = ava
            } else {
                response += ',ava'
            }

            return response
        }

        const getUserInfo = async () => {
            try {
                let responseData: string = '_select=last_session'

                responseData = getUserAvatar(responseData)

                const response: {last_session: string, ava: {url: string, id: number}} =
                    await get(`/users/${userStore.user.id}?${responseData}`)

                if (response?.last_session) {
                    userStore.lastSession = response?.last_session
                }
                if (response?.ava) {
                    userStore.user.ava = response?.ava

                    userAva.set()
                }
            } catch (err) {
                console.error('Ошибка получения данных пользователя', err)

                await showError(
                    'Ошибка загрузки данных пользователя',
                    'Не удалось загрузить данные пользователя'
                )
            }
        }
        await getUserInfo()

        await setLastSession()

        // получаем несинхронизированные данные с бд
        await onlineStore.getOfflinePosts()

        const sendSessionMessage = async () => {
            const date = getCurrentDateTime()
            if (date.date !== userStore.lastSession) {
                await sendToTelegram(TelegramEventType.NEW_SESSION)
            }
        }
        await sendSessionMessage()

        hideLoading()
    }

    // изменяем page-number для api в зависимости от разрешения экрана
    const getNumberPage = () => {
        if (window.innerWidth <= 1440) {
            pageNumberForAPI.value = 9
        } else if (window.innerWidth <= 1920 && window.innerWidth > 1440) {
            pageNumberForAPI.value = 12
        } else {
            pageNumberForAPI.value = 18
        }
    }

    watch(
        () => onlineStore.isOnlineMode,
        async () => {
            await loadInfo()
        }
    )

    return {
        firstLoading,

        loadingVisible,
        activeMenuIndex,
        pageNumberForAPI,

        loadInfo,
        getNumberPage,
    }
})

export default useHomeStore