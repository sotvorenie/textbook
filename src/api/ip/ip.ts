import {get, patch} from "../base.ts";

export const getIP = async () => {
    const response = await fetch('https://api.ipify.org?format=json')

    return await response.json()
}

export const checkBlackList = async (ip: string) => {
    const response = await get(`/black_list_ip?ip=${ip}`)

    return Array.isArray(response) && response.length > 0;
}

export const getUserIp = async (id: number): Promise<string[]> => {
    const response: [{ip: string[]}] = await get(`/users?id=${id}&_select=ip`)
    return response[0].ip
}

export const setUserIp = async (id: number, ipList: string[]) => {
    await patch(`/users/${id}`, {
        ip: ipList
    })
}