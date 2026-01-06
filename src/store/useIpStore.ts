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
    const checkIP = async(isLoading?: Ref<boolean>): Promise<void> => {
        const onlineStore = useOnlineStore();

        try {
            if (isLoading) isLoading.value = true

            const ip: {ip: string} = await getIP()

            userIp.value = ip.ip

            const check: boolean = await checkBlackList(userIp.value)

            if (check) {
                inBlackList.value = true
                onlineStore.isOnline = false
                onlineStore.isOnlineMode = false
            }
        } catch (_) {
            inBlackList.value = true
        } finally {
            if (isLoading) isLoading.value = false
        }
    }

    // проверка: есть ли данный ip у пользователя (если нет - вносим)
    const checkUserIp = async (id: number): Promise<void> => {
        const ipList: string[] = await getUserIp(id)

        const check: boolean = ipList.includes(userIp.value)

        if (!check) {
            ipList.push(userIp.value)
            await setUserIp(id, ipList)
        }
    }

    return {
        userIp,
        inBlackList,

        checkIP,
        checkUserIp,
    }
})

export default useIpStore