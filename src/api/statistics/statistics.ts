import {get, patch, post} from "../base.ts";
import {Statistic} from "./types.ts";

import useOnlineStore from "../../store/useOnlineStore.ts";
import useIdStore from "../../store/useIdStore.ts";

export const getStatistics = async (
    name: string,
    apiName: string
): Promise<Statistic | undefined> => {
    const onlineStore = useOnlineStore();
    const idStore = useIdStore();

    if (!onlineStore.isOnlineMode) return

    try {
        const id: number = idStore.idValues[name]

        return await get(`/statistics_${apiName}/${id}`)
    } catch (err: any) {
        throw err
    }
}

export const setStatistic = async (
    name: string,
    apiName: string,
    type: keyof Statistic['statistic']
): Promise<void> => {
    const onlineStore = useOnlineStore();
    const idStore = useIdStore();

    if (!onlineStore.isOnlineMode) return

    try {
        const id: number = idStore.idValues[name]

        let statistics: Statistic | undefined = await getStatistics(name, apiName)

        if (statistics) {
            statistics.statistic[type] = +statistics.statistic[type] + 1

            await patch(`/statistics_${apiName}/${id}`, statistics)
        } else {
            const item: Statistic = {
                statistic: {
                    views: type === 'views' ? 1 : 0,
                    downloads: type === 'downloads' ? 1 : 0,
                    likes: type === 'likes' ? 1 : 0,
                }
            }
            await createStatistics(apiName, item)
        }
    } catch (err) {
        throw err
    }
}

export const createStatistics = async (
    apiName: string,
    item: Statistic
): Promise<void> => {
    const onlineStore = useOnlineStore();

    if (!onlineStore.isOnlineMode) return

    try {
        await post(`/statistics_${apiName}`, item)
    } catch (err) {
        throw err
    }
}