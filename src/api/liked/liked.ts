import {patch} from "../base.ts";

import useUserStore from "../../store/userStore.ts";
const userStore = useUserStore();

export const like = async (name: string): Promise<any> => {
    await patch(`/user_liked/${userStore.userLiked.id}`, {
        items: {
            [name]: userStore.userLiked.items.hints
        }
    })
}