import {patch, post} from "../base.ts";

import {sendToTelegram, TelegramEventType} from "../telegram/telegram.ts";

import useUserStore from "../../store/useUserStore.ts";
import useOnlineStore from "../../store/useOnlineStore.ts";
import useItemsStore from "../../store/useItemsStore.ts";
import {showError} from "../../utils/modals.ts";

export const handleLike = async (name: string, id: number): Promise<any> => {
    const userStore = useUserStore();
    const itemsStore = useItemsStore();

    let isRemoveLike: boolean = false

    try {
        const element = itemsStore.items[name]?.find(el => el.id === id) ?? {title: ''}

        let isLike: boolean = false

        const userLikes = userStore.userLiked.items[name]

        if (userLikes && userLikes?.includes(id)) {
            userStore.userLiked.items[name] =
                userLikes?.filter((item: number) => item !== id)

            isRemoveLike = true
        } else {
            if (!userLikes) {
                userStore.userLiked.items[name] = []
            }
            userStore.userLiked?.items[name].push(id)
            isLike = true
        }

        const response = await like(name)

        if (response) {
            isLike ? await sendToTelegram(TelegramEventType.LIKE, element.title)
                : await sendToTelegram(TelegramEventType.UNLIKE, element.title)

            if (userStore.userLiked.id < 0) {
                userStore.userLiked.id = response.id
            }
        }
    } catch (err) {
        await showError(
            'Ошибка добавления в избранное',
            'Не удалось добавить элемент в избранное'
        )

        if (!isRemoveLike) {
            userStore.userLiked?.items[name].pop()
        } else {
            userStore.userLiked?.items[name].push(id)
        }
    }
}

const like = async (name: string): Promise<any> => {
    const userStore = useUserStore();
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