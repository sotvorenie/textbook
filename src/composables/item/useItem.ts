import {
    computed,
    nextTick,
    ref,
    onMounted,
    onBeforeUnmount
} from "vue";
import { useRoute, useRouter } from "vue-router";

import { Item } from "../../types/item.ts";

import { getAuthor, getItem, updateStatistics } from "../../api/posts/posts.ts";
import { createItemInDB, checkPost } from "../../api/posts/postsDB.ts";

import { showConfirm, showError } from "../../utils/modals.ts";
import {useSignal} from "../useSignal.ts";

import useItemMemoStore from "../../store/useItemMemoStore.ts";
import useUserStore from "../../store/useUserStore.ts";
import useMessageStore from "../../store/useMessageStore.ts";
import useOnlineStore from "../../store/useOnlineStore.ts";
import useScrollStore from "../../store/useScrollStore.ts";

export const useItem = (
    name: string,
    item: { value: Item },
    index?: { value: number }
) => {
    const route = useRoute();
    const router = useRouter();

    const itemMemoStore = useItemMemoStore();
    const userStore = useUserStore();
    const messageStore = useMessageStore();
    const onlineStore = useOnlineStore();
    const scrollStore = useScrollStore();

    const signal = useSignal()

    const isLoading = ref(false)
    const downloadVisible = ref(false)
    const isDownload = ref(false)
    const upBtnVisible = ref(false)
    const commentsVisible = ref(false)

    const scrollManager = scrollStore.useSaveScroll(name, 'item')

    const author = ref<{ name: string; id: number; ava?: { url: string } }>({
        name: "",
        id: -1,
    })

    let mainElement: HTMLElement | null = null

    const id = computed(() =>
        route.params.id ? Number(route.params.id) : undefined
    )

    const updateScrollBtnVisible = () => {
        if (!mainElement) return
        upBtnVisible.value = mainElement.scrollTop > 20
    }

    const updateBlocksVisible = () => {
        if (!mainElement || commentsVisible.value) return

        commentsVisible.value = mainElement.scrollHeight - mainElement.scrollTop - mainElement.clientHeight <= 100
    }

    const onScroll = () => {
        updateScrollBtnVisible()
        updateBlocksVisible()
    }

    const attachScroll = () => {
        if (!mainElement) return
        mainElement.addEventListener("scroll", onScroll)
    }

    const detachScroll = () => {
        if (!mainElement) return
        mainElement.removeEventListener("scroll", onScroll)
    }

    const clickToUp = () => {
        if (!mainElement) return

        mainElement.scrollTo({ top: 0, behavior: "smooth" })
        scrollStore.scrolls[name].item = 0
    }

    const escapeHtml = (str: string) =>
        str
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;")

    const decodeHtmlEntities = (str: string) => {
        const textarea = document.createElement("textarea")
        textarea.innerHTML = str
        return textarea.value
    }

    const highlightCodeComments = (code: string) =>
        escapeHtml(code).replaceAll(
            /(\/\/.*$)/gm,
            '<span class="item__comment">$1</span>'
        )

    const preserveLineBreaks = (str: string) =>
        str.replaceAll(/<br\s*\/?>/gi, "\n").replaceAll("&nbsp;", " ")

    const parsedText = computed(() => {
        if (!item.value) return []

        const text = index
            ? Object.values(item.value.content ?? {})[index.value]
            : item.value.text

        if (!text) return []

        const regex =
            /<pre><code>[\s\S]*?<\/code><\/pre>|<h3>[\s\S]*?<\/h3>|<p>[\s\S]*?<\/p>/gi

        const blocks = text.match(regex) ?? []

        return blocks.map((block) => {
            let type: "title" | "text" | "code"
            let raw: string

            if (block.startsWith("<pre")) {
                type = "code"
                raw = block.replaceAll(/<\/?pre>|<\/?code>/g, "")
            } else if (block.startsWith("<h3")) {
                type = "title"
                raw = block.replaceAll(/<\/?h3>/g, "")
            } else {
                type = "text"
                raw = block.replaceAll(/<\/?p>/g, "")
            }

            const content = decodeHtmlEntities(preserveLineBreaks(raw))

            return {
                type,
                content: type === "code" ? highlightCodeComments(content) : content,
            }
        })
    })

    const loadAuthor = async (userId: number) => {
        const data = await getAuthor(userId, false, signal)
        author.value = {
            id: userId,
            name: data.name,
            ava: data.ava,
        }
    }

    const loadItem = async () => {
        if (!id.value) return

        item.value = {} as Item
        author.value = { name: "", id: -1 }
        commentsVisible.value = false
        upBtnVisible.value = false

        detachScroll()

        const cached = itemMemoStore.getItem(name, id.value)

        try {
            if (cached) {
                item.value = cached
            } else {
                if (onlineStore.isOnlineMode) isLoading.value = true

                const data = await getItem(name, id.value, signal)
                item.value = data
                itemMemoStore.setItem(name, id.value, data)

                await updateStatistics(
                    name,
                    data.id!,
                    "views",
                    data.statistics ?? { views: 0, downloads: 0, likes: 0 },
                    signal
                )
            }

            if (onlineStore.isOnlineMode) {
                downloadVisible.value = !(await checkPost(id.value, name))

                if (item.value.user_id === userStore.user.id) {
                    userStore.isUserPost[name] = true
                } else {
                    await loadAuthor(item.value.user_id)
                }
            }
        } catch (err) {
            console.error('Ошибка загрузки элемента', err)

            await showError("Ошибка", "Не удалось загрузить элемент")
            await router.push({name})
            return
        }

        isLoading.value = false

        await nextTick()

        mainElement ??= document.querySelector(".home__main")

        if (mainElement) {
            mainElement.scrollTop = 0
            updateScrollBtnVisible()
            updateBlocksVisible()
            attachScroll()
        }
    }

    const handleCopy = async (code: string): Promise<void> => {
        try {
            await navigator.clipboard.writeText(decodeHtmlEntities(code))

            messageStore.show('Скопировано')
        } catch (err) {
            console.error('ошибка копирования', err)

            await showError(
                'Ошибка копирования',
                'Не удалось скопировать данные..'
            )
        }
    }

    const handleDownload = async () => {
        const ok = await showConfirm(
            "Скачивание материала",
            "Вы действительно хотите скачать материал?"
        )
        if (!ok) return

        isDownload.value = true

        try {
            await createItemInDB(name, item.value, item.value.id)
            await updateStatistics(
                name,
                item.value.id!,
                "downloads",
                item.value.statistics,
                signal
            )
            messageStore.show("Скачано")
        } catch {
            messageStore.show("Ошибка скачивания", true)
        } finally {
            isDownload.value = false
            downloadVisible.value = false
        }
    }

    onMounted(async () => {
        await loadItem()
        scrollManager.setup()
        await scrollManager.restoreScroll()
    })

    onBeforeUnmount(() => {
        userStore.isUserPost[name] = false
        detachScroll()
        scrollManager.destroy()
    })

    return {
        isLoading,
        parsedText,

        handleCopy,

        handleDownload,
        isDownload,
        downloadVisible,

        upBtnVisible,
        clickToUp,

        commentsVisible,

        author,
    }
}