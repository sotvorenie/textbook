import {patch, post} from "../base.ts";

import useUserStore from "../../store/useUserStore.ts";

const userStore = useUserStore();

import useOnlineStore from "../../store/useOnlineStore.ts";

export const like = async (name: string): Promise<any> => {

    const onlineStore = useOnlineStore();

    try {
        if (userStore.userLiked.id >= 0) {
            return await patch(`/user_liked/${userStore.userLiked.id}`, {
                items: {
                    ...userStore.userLiked.items
                }
            })
        } else {
            const response = await post(`/user_liked`, {
                user_id: userStore.user.id,
                items: {
                    [name]: userStore.userLiked.items[name]
                }
            })

            if (response) return response
        }
    } catch (err: any) {
        if (err.message === "Network Error" || err.code === "ECONNABORTED") {
            onlineStore.isOnline = false;
            onlineStore.isOnlineMode = false;
        }
        throw err;
    }
}