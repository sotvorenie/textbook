import {get, patch, post} from "../base.ts";
import {Statistic} from "./types.ts";

import useOnlineStore from "../../store/useOnlineStore.ts";
import useIdStore from "../../store/useIdStore.ts";

export const getStatistics = async (name: string): Promise<Statistic | undefined> => {
    const onlineStore = useOnlineStore();
    const idStore = useIdStore();

    if (!onlineStore.isOnlineMode) return

    try {
        const id: number = idStore.idValues[name]

        return await get(`/statistics/${id}`)
    } catch (err: any) {
        throw err
    }
}

export const setStatistic = async (name: string, type: keyof Statistic['statistic']): Promise<void> => {
    const onlineStore = useOnlineStore();
    const idStore = useIdStore();

    if (!onlineStore.isOnlineMode) return

    try {
        const id: number = idStore.idValues[name]

        let statistics: Statistic | undefined = await getStatistics(name)

        if (statistics) {
            statistics.statistic[type] = +statistics.statistic[type] + 1

            await patch(`/statistics/${id}`, statistics)
        } else {
            const item: Statistic = {
                statistic: {
                    views: type === 'views' ? 1 : 0,
                    downloads: type === 'downloads' ? 1 : 0,
                    likes: type === 'likes' ? 1 : 0,
                }
            }
            await createStatistics(item)
        }
    } catch (err) {
        throw err
    }
}

export const createStatistics = async (item: Statistic): Promise<void> => {
    const onlineStore = useOnlineStore();

    if (!onlineStore.isOnlineMode) return

    try {
        await post(`/statistics`, item)
    } catch (err) {
        throw err
    }
}