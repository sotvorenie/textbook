import {computed, nextTick, onActivated, onDeactivated, onMounted, ref, watchEffect} from "vue";

import {Item} from "../../types/item.ts";

import {showConfirm, showError} from "../../utils/modals.ts";
import decodeHtmlEntities from "../useDecodeHtmlEntities.ts";

import {getItem} from "../../api/posts/posts.ts";
import {checkPost, createItemInDB} from "../../api/posts/postsDB.ts";

import useIdStore from "../../store/useIdStore.ts";
import useItemMemoStore from "../../store/useItemMemoStore.ts";
import useSettingsStore from "../../store/useSettingsStore.ts";
import useUserStore from "../../store/useUserStore.ts";
import useBlocksStore from "../../store/useBlocksStore.ts";
import useMessageStore from "../../store/useMessageStore.ts";
import useOnlineStore from "../../store/useOnlineStore.ts";
import useScrollStore from "../../store/useScrollStore.ts";

export const useItem = (
    name: string,
    apiName: string,
    item: {value: Item},
    index?: {value: number}
) => {
    const idStore = useIdStore()
    const itemMemoStore = useItemMemoStore();
    const settingsStore = useSettingsStore();
    const userStore = useUserStore();
    const blocksStore = useBlocksStore();
    const messageStore = useMessageStore();
    const onlineStore = useOnlineStore();
    const scrollStore = useScrollStore();

    let mainElement: HTMLElement | null = null

    //=========================================================//
    //-- запросы к апи --//
    const getListItem = async () => {
        try {
            if (!idStore.idValues[name]) return

            const response = await getItem(apiName, idStore.idValues[name]);
            if (response) {
                item.value = response;
            }
        } catch (err){
            await showError(
                'Ошибка загрузки элемента',
                'Не удалось загрузить элемент'
            )

            throw err
        }
    }
    //=========================================================//


    //=========================================================//
    //-- загрузка --//
    // видимость анимации загрузки
    const isLoading = ref<boolean>(true)
    //=========================================================//


    //=========================================================//
    //-- работа с текстом --//
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
    //=========================================================//


    //=========================================================//
    //-- блок с кодом --//
    // копирование кода
    const handleCopy = async (code: string): Promise<void> => {
        try {
            await navigator.clipboard.writeText(decodeHtmlEntities(code));

            messageStore.show('Скопировано')
        } catch (_) {
            await showError(
                'Ошибка копирования',
                'Не удалось скопировать данные..'
            )
        }
    }
    //=========================================================//


    //=========================================================//
    //-- скачивание --//
    // видимость кнопки "Скачать"
    const downloadVisible = ref<boolean>(false)

    // видимость анимации скачивания
    const isDownload =  ref<boolean>(false)


    // клик по кнопке "Скачать"
    const handleDownload = async () => {
        const check = await showConfirm(
            'Скачивание материала',
            'Вы действительно хотите скачать данный материал?'
        )

        if (check) {
            isDownload.value = true

            try {
                await createItemInDB(apiName, item.value, item.value.id)

                isDownload.value = false
            } catch (_) {
                messageStore.show('Не удалось скачать..', true)
            } finally {
                downloadVisible.value = false
            }
        }
    }
    //=========================================================//


    //=========================================================//
    //-- подъем наверх --//
    // видимость кнопки подъема наверх
    const upBtnVisible = ref<boolean>(true)


    // кли по кнопке подъема
    const clickToUp = () => {
        if (mainElement) {
            mainElement.scrollTo({
                top: 0,
                behavior: 'smooth',
            })
            scrollStore.scrolls[name].item = 0
        }
    }

    // при scroll-е показываем кнопку поднятия наверх
    const updateScrollBtnVisible = () => {
        if (!mainElement) return

        const topPosition: number = mainElement.scrollTop

        upBtnVisible.value = topPosition > 0
    }
    //=========================================================//


    //=========================================================//
    //-- статистика и комментарии --//
    // видимость блока статистики и комментариев
    const statisticsAndCommentsVisible = ref<boolean>(false)


    // добавление видимости блока, когда мы до-листали до низа
    const updateBlocksVisible = () => {
        if (!mainElement || statisticsAndCommentsVisible.value) return

        statisticsAndCommentsVisible.value =
            mainElement.scrollHeight - mainElement.scrollTop - mainElement.clientHeight <= 100
    }
    //=========================================================//


    //=========================================================//
    //-- хуки --//
    onActivated(async () => {
        isLoading.value = true
        upBtnVisible.value = false
        statisticsAndCommentsVisible.value = false

        const data = itemMemoStore.getItem(
            name,
            idStore.idValues[name]
        );

        settingsStore.settingsVisible[name] = 'item';

        if (data) {
            item.value = data
        } else {
            try {
                await getListItem();

                itemMemoStore.setItem(
                    name,
                    idStore.idValues[name], item.value
                )
            } catch (_) {
                blocksStore.activeBlock[name] = 'list'
                settingsStore.settingsVisible[name] = 'list'

                return
            }
        }

        if (item.value.user_id === userStore.user.id) {
            userStore.isUserPost[name] = true
        }

        isLoading.value = false

        await nextTick()
        updateBlocksVisible()

        if (mainElement) {
            mainElement.addEventListener('scroll', () => {
                updateScrollBtnVisible()
                updateBlocksVisible()
            })
        }
    })

    onDeactivated(() => {
        if (mainElement) {
            mainElement.removeEventListener('scroll', () => {
                updateScrollBtnVisible()
                updateBlocksVisible()
            })
        }
    })

    onMounted(() => {
        mainElement = document.querySelector('.home__main')
    })

    // проверка наличие поста в бд
    watchEffect(async () => {
        if (!onlineStore.isOnlineMode) return

        downloadVisible.value = !await checkPost(name, apiName)
    })
    //=========================================================//


    return {
        isLoading,

        parsedText,

        handleCopy,

        downloadVisible,
        isDownload,
        handleDownload,

        upBtnVisible,
        clickToUp,

        statisticsAndCommentsVisible,
        updateBlocksVisible,
    }
}