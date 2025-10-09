import {computed, onActivated, Ref} from "vue";

import {Item} from "../types/item.ts";

import {getItem} from "../api/posts/posts.ts";

import useIdStore from "../store/idStore.ts";
const idStore = useIdStore()
import useItemMemoStore from "../store/itemMemoStore.ts";
const itemMemoStore = useItemMemoStore();
import useSettingsStore from "../store/settingsStore.ts";
const settingsStore = useSettingsStore();
import useUserStore from "../store/userStore.ts";
const userStore = useUserStore();

export const useItem = (
    loading: Ref<boolean>,
    name: string,
    apiName: string,
    item: Ref<Item>,
    index?: Ref<number>
) => {
    const getListItem = async () => {
        try {
            if (!idStore.idValues[name]) return

            const response = await getItem(apiName, idStore.idValues[name]);
            if (response) {
                item.value = response;
            }
        } catch (_){}
    }

    const highlightCodeComments = (code: string): string => {
        return code.replace(/(\/\/.*$)/gm, '<span class="item__comment">$1</span>');
    };

    const parsedText = computed(() => {
        let text: string
        if (index) {
            text = Object.values(item.value.content!)[index.value]
        } else {
            text = item.value.text!
        }

        if (!text) return [];

        const regex = /<code>(.*?)<\/code>/gis;
        let lastIndex = 0;
        const result: Array<{ type: "text" | "code"; content: string }> = [];

        let match;
        while ((match = regex.exec(text)) !== null) {
            const index = match.index;

            if (index > lastIndex) {
                const rawText = text?.slice(lastIndex, index);
                const restoredText = rawText
                    .replace(/<br\s*\/?>/gi, "\n")
                    .replace(/&nbsp;/g, ' ')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/<[^>]*>/g, '');

                result.push({ type: "text", content: restoredText });
            }

            const codeContent = match[1]
                .replace(/<br\s*\/?>/gi, "\n")
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>');

            const highlightedCode = highlightCodeComments(codeContent);
            result.push({ type: "code", content: highlightedCode });

            lastIndex = regex.lastIndex;
        }

        if (lastIndex < text?.length) {
            const remainingText = text?.slice(lastIndex)
                .replace(/<br\s*\/?>/gi, "\n")
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/<[^>]*>/g, '');

            result.push({ type: "text", content: remainingText });
        }

        return result;
    });

    onActivated(async () => {
        loading.value = true

        const data = itemMemoStore.getItem(
            name,
            idStore.idValues[name]
        );

        settingsStore.settingsVisible[name] = 'item';

        if (data) {
            item.value = data
        } else {
            await getListItem();

            itemMemoStore.setItem(
                name,
                idStore.idValues[name], item.value
            )
        }

        if (item.value.user_id === userStore.user.id) {
            userStore.isUserPost[name] = true
        }

        loading.value = false
    })

    return parsedText
}