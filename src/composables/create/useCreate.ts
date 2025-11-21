import {onMounted, ref} from "vue";

import {Item} from "../../types/item.ts";

import {showAsk, showConfirm, showError} from "../../utils/modals.ts";
import {onBlur, onSubmit} from "../useFormValidation.ts";
import {removeLabelText} from "../useLabelText.ts";
import {getCurrentDateTime} from "../useDate.ts";

import {sendToTelegram, TelegramEventType} from "../../api/telegram/telegram.ts";
import {createItem, redactItem} from "../../api/posts/posts.ts";
import {checkPost} from "../../api/posts/postsDB.ts";

import useCreateStore from "../../store/useCreateStore.ts";
import useOnlineStore from "../../store/useOnlineStore.ts";
import useItemsStore from "../../store/useItemsStore.ts";
import useBlocksStore from "../../store/useBlocksStore.ts";
import useSettingsStore from "../../store/useSettingsStore.ts";
import useUserStore from "../../store/useUserStore.ts";
import useTechnologiesStore from "../../store/useTechnologiesStore.ts";
import useItemMemoStore from "../../store/useItemMemoStore.ts";

const names: Record<string, string> = {
    hints: 'подсказки',
    textbooks: 'учебника',
    projects: 'проекта',
    advices: 'совета',
}

export const cancel = async (
    name: string,
    back: Function,
    type: string = 'создание'
) => {
    const confirm = await showConfirm(
        `Отмена создания ${names[name]}`,
        `Вы действительно хотите отменить ${type} ${names[name]}?`
    )

    if (confirm) back()
}

// список всевозможных типов полей ввода
export const textareaAttributesList: Record<string, { name: string, code: string }> = {
    code: {
        name: 'Код',
        code: 'code',
    },
    text: {
        name: 'Текст',
        code: 'text',
    },
    title: {
        name: 'Подзаголовок',
        code: 'title',
    },
}

export const useCreate = (name: string, apiName: string) => {
    const createStore = useCreateStore()
    const onlineStore = useOnlineStore()
    const itemsStore = useItemsStore()
    const blocksStore = useBlocksStore()
    const settingsStore = useSettingsStore()
    const userStore = useUserStore()
    const technologiesStore = useTechnologiesStore()
    const itemMemoStore = useItemMemoStore()

    //=========================================================//
    //-- кнопки действий --//
    const back = (
        name: string,
        type: string = 'no_textbooks'
    ) => {
        blocksStore.activeBlock[name] = 'list';
        settingsStore.settingsVisible[name] = 'list'

        createStore.createData[name] = {
            title: '',
            [type]: type === 'textbooks' ? {} : '',
            id: -1,
            languages_and_technologies: []
        }
        createStore.isRedact[name] = false
    }

    // потеря фокуса поля ввода заголовка
    const blurInput = (event: Event) => {
        onBlur(event);
        removeLabelText(event);
    }

    // сохранение
    const save = async (
        event: Event,
        newItem: Item,
        tabs?: any
    ) => {
        const valid: boolean = onSubmit(event)

        if (!valid) return

        const names: Record<string, string> = {
            hints: 'подсказки',
            projects: 'проекта',
            advices: 'совета',
            textbooks: 'учебника',
        }

        const names_2: Record<string, string> = {
            hints: 'подсказку',
            projects: 'проект',
            advices: 'совет',
            textbooks: 'учебник',
        }

        const ask = await showAsk(
            `Сохранение ${names[name]}`,
            `Вы действительно хотите сохранить ${names_2[name]}?`
        )

        if (ask) await sendRequest(
            newItem,
            tabs
        )
    }

    // клик по кнопке "Отмена"
    const handleBack = async (): Promise<void> => {
        if (userStore.isUserPost[name]
            && blocksStore.activeBlock[name] === 'create'
            && createStore.isRedact[name]
        ) {
            await cancel(name, () => {
                blocksStore.activeBlock[name] = 'item'

                createStore.createData[name] = {
                    title: '',
                    content: {},
                    id: -1,
                    languages_and_technologies: []
                }

                createStore.isRedact[name] = false
            }, 'редактирование')
        } else {
            await cancel(name, back)
            userStore.isUserPost[name] = false
        }
    }
    //=========================================================//


    //=========================================================//
    //-- асинхронные функции --//
    const sendRequest = async (
        newItem: Item,
        tabs?: any
    ) => {
        checkTabsLength(newItem, tabs)

        getDateData(newItem)

        setLanguages(newItem)

        const isCreating = !createStore.createData[name].title.length;

        try {
            if (isCreating) {
                await create(newItem)
            } else {
                await redact(newItem)
            }
        } catch (err) {
            await showError(
                isCreating ? 'Ошибка создания записи' : 'Ошибка редактирования записи',
                isCreating ? 'Не удалось создать запись..' : 'Не удалось редактировать запись..'
            );
        }

        await sendToTg(newItem)

        newItems.value = [];

        back(name, tabs ? 'textbooks' : undefined);
    };

    // проверка наличия tab-ов
    const checkTabsLength = (newItem: Item, tabs: any) => {
        if (tabs && tabs?.length > 0) {
            const content: Record<string, string> = {};
            for (const tab of tabs) {
                const key = tab.name || `tab${tab.id}`;
                content[key] = convertBlocksToText(newItemsTextbook.value[String(tab.id)] || []);
            }
            newItem.content = content;
        } else {
            newItem.text = convertBlocksToText(newItems.value);
        }
    }

    // получаем данные о дате
    const getDateData = (newItem: Item) => {
        const dateTime = getCurrentDateTime();

        newItem.time = dateTime.time;
        newItem.date = dateTime.date;
        newItem.sort_date = dateTime.sort_date;
    }

    // задаем языки и технологии
    const setLanguages = (newItem: Item) => {
         if (onlineStore.isOnlineMode) {
             newItem.languages_and_technologies = technologies.value
                 ?.filter(item => item.checked)
                 ?.map(item => item.title);
         } else {
             newItem.languages_and_technologies =
                 createStore.createData[name].languages_and_technologies;
         }
    }

    // создание записи
    const create = async (newItem: Item) => {
        const createInDB: boolean = onlineStore.isOnlineMode ? localCopyActive.value : true;
        const response: Item = await createItem(
            apiName,
            newItem,
            createInDB,
            createStore.isCanCreateInAPI[name]
        );

        if (response?.id && (createStore.isCanCreateInAPI[name] || !onlineStore.isOnlineMode)) {
            itemsStore.items[name].unshift({
                id: response.id,
                title: response.title,
                date: response.date,
                languages_and_technologies: response.languages_and_technologies,
            });

            const cacheElement = itemMemoStore.findItemById(response.id);
            if (cacheElement) itemMemoStore.updateItemInCacheById(name, response.id, newItem);
        }
    }

    // редактирование записи
    const redact = async (newItem: Item) => {
        const response = await redactItem(
            apiName,
            newItem,
            createStore.createData[name].id
        );

        if (response?.id) {
            setNewLanguages();
            itemsStore.items[name] = itemsStore.items[name]?.map(el =>
                el.id === response.id ? { ...el, title: response.title } : el
            );

            itemMemoStore.updateLastItemInCache(name, newItem);
        }
    }

    // отправка запроса в тг
    const sendToTg = async (newItem: Item) => {
        const blockNameToEventType: Record<string, TelegramEventType> = {
            hints: TelegramEventType.CREATE_HINTS,
            textbooks: TelegramEventType.CREATE_TEXTBOOKS,
            projects: TelegramEventType.CREATE_PROJECTS,
            advices: TelegramEventType.CREATE_ADVICES,
        };

        try {
            await sendToTelegram(blockNameToEventType[name], newItem.title);
        } catch {}
    }
    //=========================================================//


    //=========================================================//
    //-- textarea --//
    // элементы textarea
    const newItems= ref<{
        id: string,
        type: string,
        text: string,
        attributes: {
            name: string,
            code: string,
        },
    }[]>([])

    // элементы textarea textbooks
    const newItemsTextbook = ref<Record<string, {
        id: string;
        type: string;
        text: string;
        attributes: {
            name: string;
            code: string;
        }
    }[]>>({});

    // видимость кнопок создания новых textarea (чтобы ограничить число textarea)
    const isVisibleCreateBtnBar = (id?: number) => {
        const mainLimit = newItems.value.length < 10
        const tabLimit = id !== undefined
            ? (newItemsTextbook.value[id]?.length ?? 0) < 10
            : true

        return mainLimit && tabLimit
    }


    // создание нового поля ввода
    const createTextarea = (type: string, tabId?: number): void => {
        const item = {
            id: crypto.randomUUID(),
            type,
            text: '',
            attributes: textareaAttributesList[type]
        }

        if (tabId !== undefined) {
            if (!newItemsTextbook.value[tabId]) newItemsTextbook.value[tabId] = [];

            newItemsTextbook.value[tabId].push(item);
        } else {
            newItems.value.push(item)
        }
    };

    // удаление поля ввода
    const removeTextarea = (index: number, tabId?: number) => {
        if (tabId) {
            newItemsTextbook.value[tabId]?.splice(index, 1);
        } else {
            newItems.value.splice(index, 1)
        }
    };
    //=========================================================//


    //=========================================================//
    //-- языки и технологии --//
    // список языков и технологий с полями checked для checkbox
    const technologies = ref<{title: string, checked: boolean}[]>([]);


    // выбор технологий при редактировании поста
    const getSearchTechnologies = () => {
        let languages = createStore.createData[name].languages_and_technologies

        if (!languages.length) return

        technologies.value = technologies.value.map(t => ({
            title: t.title,
            checked: languages.includes(t.title)
        }));
    }

    // если изменился список языков, то добавить в нужный элемент list
    const setNewLanguages = () => {
        if (!onlineStore.isOnlineMode) return

        const oldLanguages = createStore.createData[name].languages_and_technologies
        const newLanguages = technologies.value
            .filter(t => t.checked)
            .map(t => t.title)

        if (JSON.stringify(oldLanguages) === JSON.stringify(newLanguages)) return

        itemsStore.items[name] = itemsStore.items[name].map(item => {
            if (item.id === createStore.createData[name].id) {
                return {
                    ...item,
                    languages_and_technologies: newLanguages
                }
            }
            return item
        })
    }

    // получаем список всевозможных языков и технологий, чтобы отобразить их с checkbox
    const getTechnologies = (func: Function,) => {
        technologiesStore.technologies?.forEach(el => {
            technologies.value.push({
                title: el,
                checked: false
            })
        })

        func()

        getSearchTechnologies()
    }
    //=========================================================//


    //=========================================================//
    //-- конвертация --//
    // конвертация текста в блоки (при редактировании записи)
    const convertTextToBlocks = (str: string): { type: string, text: string }[] => {
        if (!str) return [];

        const blocks: { type: string, text: string }[] = [];
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = str;

        const decodeHtmlEntities = (text: string): string => {
            const textarea = document.createElement('textarea');
            textarea.innerHTML = text;
            return textarea.value;
        };

        const processElement = (element: Element): { type: string, text: string } | null => {
            let text = element.innerHTML;

            if (element.tagName === 'PRE' && element.querySelector('code')) {
                const codeElement = element.querySelector('code');
                if (codeElement) {
                    let codeText = codeElement.innerHTML
                        .replace(/<br\s*\/?>/gi, '\n')
                        .replace(/&nbsp;/g, ' ');

                    codeText = decodeHtmlEntities(codeText);

                    return {
                        type: 'code',
                        text: codeText
                    };
                }
            } else if (element.tagName === 'H3') {
                text = element.textContent || '';
                text = decodeHtmlEntities(text);

                return {
                    type: 'title',
                    text: text
                };
            } else if (element.tagName === 'P') {
                text = element.innerHTML;
                text = text
                    .replace(/<br\s*\/?>/gi, '\n')
                    .replace(/&nbsp;/g, ' ');

                text = decodeHtmlEntities(text);

                return {
                    type: 'text',
                    text: text
                };
            }

            return null;
        };

        for (const child of Array.from(tempDiv.children)) {
            const block = processElement(child);
            if (block) {
                blocks.push(block);
            }
        }

        return blocks;
    };

    // конвертирование блоков в текст для отправки в апи
    const convertBlocksToText = (blocks: { type: string, text: string }[]): string => {
        return blocks?.map(block => {
            const escapeHtml = (text: string): string => {
                return text
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;');
            };

            const formattedText = escapeHtml(block.text)
                .replace(/\n/g, '<br>')
                .replace(/ /g, '&nbsp;');

            if (block.type === 'code') {
                return `<pre><code>${formattedText}</code></pre>`;
            } else if (block.type === 'title') {
                return `<h3>${formattedText}</h3>`;
            } else {
                return `<p>${formattedText}</p>`;
            }
        }).join('');
    };
    //=========================================================//


    //=========================================================//
    //-- локальная копия --//
    // создавать ли локальную копию создаваемого поста
    const localCopyActive = ref<boolean>(true)

    // видимость переключателя (в случае если мы редактируем запись которой нет в бд)
    const isVisibleLocalHandler = ref<boolean>(false)


    // переключение значения локальной копии
    const handleLocalCopy = () => {
        localCopyActive.value = !localCopyActive.value;
    }
    //=========================================================//

    //=========================================================//
    //-- хуки --//
    //проверка наличия поста в БД для редактирования (если данный пост в БД есть то показывать переключать сохранять/не сохранять запись локально при редактировании)
    onMounted(async () => {
        if (!onlineStore.isOnlineMode || !createStore.isCanCreateInAPI[name]) {
            isVisibleLocalHandler.value = false
        } else if (!createStore.isRedact[name]) {
            isVisibleLocalHandler.value = true
        } else {
            isVisibleLocalHandler.value = await checkPost(name, apiName)
        }
    })
    //=========================================================//


    return {
        cancel,
        blurInput,
        save,
        handleBack,

        newItems,
        newItemsTextbook,
        isVisibleCreateBtnBar,
        createTextarea,
        removeTextarea,

        technologies,
        getSearchTechnologies,
        getTechnologies,

        convertTextToBlocks,

        localCopyActive,
        isVisibleLocalHandler,
        handleLocalCopy,
    }
}