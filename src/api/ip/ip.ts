import {get, patch} from "../base.ts";

export const getIP = async (signal?: AbortSignal) => {
    const response = await fetch('https://api.ipify.org?format=json', {signal})

    return await response.json()
}

export const checkBlackList = async (ip: string, signal?: AbortSignal) => {
    const response = await get(`/black_list_ip?ip=${ip}`, undefined, signal)

    return Array.isArray(response) && response.length > 0;
}

export const getUserIp = async (id: number, signal?: AbortSignal): Promise<string[]> => {
    const response: [{ip: string[]}] = await get(`/users?id=${id}&_select=ip`, undefined, signal)
    return response[0].ip
}

export const setUserIp = async (id: number, ipList: string[], signal?: AbortSignal) => {
    await patch(`/users/${id}`, {
        ip: ipList
    }, signal)
}