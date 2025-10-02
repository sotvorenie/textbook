import {patch, post} from "../base.ts";

import useUserStore from "../../store/userStore.ts";

const userStore = useUserStore();

export const like = async (name: string): Promise<any> => {

    if (userStore.userLiked.id >= 0) {
        return await patch(`/user_liked/${userStore.userLiked.id}`, {
            items: {
                [name]: userStore.userLiked.items[name]
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
}