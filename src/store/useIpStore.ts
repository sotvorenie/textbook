import {defineStore} from "pinia";
import {Ref, ref} from "vue";
import {checkBlackList, getIP, getUserIp, setUserIp} from "../api/ip/ip.ts";
import useOnlineStore from "./useOnlineStore.ts";

const useIpStore = defineStore("ipStore", () => {
    // ip пользователя
    const userIp = ref<string>('')

    // в черном ли мы списке
    const inBlackList = ref<boolean>(false)

    // проверка: в черном списке ли мы или нет
    const checkIP = async(isLoading?: Ref<boolean>, signal?: AbortSignal): Promise<void> => {
        const onlineStore = useOnlineStore();

        try {
            if (isLoading) isLoading.value = true

            const ip: {ip: string} = await getIP(signal)

            userIp.value = ip.ip

            const check: boolean = await checkBlackList(userIp.value, signal)

            if (check) {
                inBlackList.value = true
                onlineStore.isOnline = false
                onlineStore.isOnlineMode = false
            }
        } catch (err) {
            console.error('ошибка проверки черного списка', err)

            inBlackList.value = true
        } finally {
            if (isLoading) isLoading.value = false
        }
    }

    // проверка: есть ли данный ip у пользователя (если нет - вносим)
    const checkUserIp = async (id: number, signal?: AbortSignal): Promise<void> => {
        const ipList: string[] = await getUserIp(id, signal)

        const check: boolean = ipList.includes(userIp.value)

        if (!check) {
            ipList.push(userIp.value)
            await setUserIp(id, ipList, signal)
        }
    }

    const resetStore = () => {
        userIp.value = ''
        inBlackList.value = false
    }

    return {
        userIp,
        inBlackList,

        checkIP,
        checkUserIp,

        resetStore,
    }
})

export default useIpStore