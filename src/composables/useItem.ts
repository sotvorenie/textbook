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

    const escapeHtml = (str: string) => {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    };

    const highlightCodeComments = (code: string): string => {
        const escaped = escapeHtml(code);

        return escaped.replace(/(\/\/.*$)/gm, '<span class="item__comment">$1</span>');
    };

    const parsedText = computed(() => {
        let text: string;
        if (index) {
            text = Object.values(item.value.content!)[index.value];
        } else {
            text = item.value.text!;
        }

        if (!text) return [];

        const result: Array<{ type: "title" | "text" | "code"; content: string }> = [];

        const decodeHtmlEntities = (str: string): string => {
            const textarea = document.createElement('textarea');
            textarea.innerHTML = str;
            return textarea.value;
        };

        const preserveLineBreaks = (str: string): string => {
            return str
                .replace(/<br\s*\/?>/gi, "\n")
                .replace(/&nbsp;/g, " ");
        };

        const regex = /<pre><code>[\s\S]*?<\/code><\/pre>|<h3>[\s\S]*?<\/h3>|<p>[\s\S]*?<\/p>/gi;
        const blocks = text.match(regex);

        if (!blocks) return [];

        for (const block of blocks) {
            let type: "title" | "text" | "code";
            let rawContent: string;

            if (block.match(/^<pre><code(?:\s[^>]*)?>/)) {
                type = "code";
                rawContent = block.replace(/^<pre><code(?:\s[^>]*)?>|<\/code><\/pre>$/g, "");
            } else if (block.startsWith("<h3>")) {
                type = "title";
                rawContent = block.replace(/<\/?h3>/g, "");
            } else {
                type = "text";
                rawContent = block.replace(/<\/?p>/g, "");
            }

            // Сохраняем только явные переносы строк
            const formattedContent = preserveLineBreaks(rawContent);

            // Декодируем HTML-сущности
            const decodedContent = decodeHtmlEntities(formattedContent);

            result.push({
                type,
                content: type === "code" ? highlightCodeComments(decodedContent) : decodedContent
            });
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