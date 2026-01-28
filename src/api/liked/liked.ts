import {Item} from "../../types/item.ts";

import {showError} from "../../utils/modals.ts";
import {updateStatistics} from "../posts/posts.ts";

import {patch, post} from "../base.ts";
import {sendToTelegram, TelegramEventType} from "../telegram/telegram.ts";

import useUserStore from "../../store/useUserStore.ts";
import useItemsStore from "../../store/useItemsStore.ts";


export const handleLike = async (
    name: string,
    id: number,
    signal?: AbortSignal,
    statistics?: Item['statistics']
): Promise<any> => {
    const userStore = useUserStore();
    const itemsStore = useItemsStore();

    let isRemoveLike: boolean = false

    try {
        const element = itemsStore.items[name]?.find(el => el.id === id) ?? {title: ''}

        let isLike: boolean = false

        const userLikes = userStore.userLiked.items[name]

        if (userLikes?.includes(id)) {
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

        const response = await like(name, signal)

        if (isLike && statistics) await updateStatistics(name, id, 'likes', statistics!, signal)

        if (response) {
            isLike ? await sendToTelegram(TelegramEventType.LIKE, signal, element.title)
                : await sendToTelegram(TelegramEventType.UNLIKE, signal, element.title)

            if (userStore.userLiked.id < 0) {
                userStore.userLiked.id = response.id
            }
        }
    } catch (err) {
        console.error('handleLike failed', err)

        await showError(
            'Ошибка добавления в избранное',
            'Не удалось добавить элемент в избранное'
        )

        if (isRemoveLike) {
            userStore.userLiked?.items[name].push(id)
        } else {
            userStore.userLiked?.items[name].pop()
        }
    }
}

const like = async (name: string, signal?: AbortSignal): Promise<any> => {
    const userStore = useUserStore();

    if (userStore.userLiked.id >= 0) {
        return await patch(`/user_liked/${userStore.userLiked.id}`, {
            items: {
                ...userStore.userLiked.items
            }, signal
        })
    } else {
        const response = await post(`/user_liked`, {
            user_id: userStore.user.id,
            items: {
                [name]: userStore.userLiked.items[name]
            },
            signal
        })

        if (response) return response
    }
}