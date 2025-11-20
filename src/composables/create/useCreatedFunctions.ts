import {showConfirm} from "../../utils/modals.ts";
import {onBlur} from "../useFormValidation.ts";
import {removeLabelText} from "../useLabelText.ts";

import useCreateStore from "../../store/useCreateStore.ts";
import useOnlineStore from "../../store/useOnlineStore.ts";
import useItemsStore from "../../store/useItemsStore.ts";
import useBlocksStore from "../../store/blocksStore.ts";
import useSettingsStore from "../../store/settingsStore.ts";
import useUserStore from "../../store/userStore.ts";
import useTechnologiesStore from "../../store/technologiesStore.ts";

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

// потеря фокуса поля ввода заголовка
export const blurInput = (event: Event) => {
    onBlur(event);
    removeLabelText(event);
}

//=========================================================//
//-- языки и технологии --//
// выбор технологий при редактировании поста
export const getSearchTechnologies = (
    name: string,
    technologies: {value: {title: string, checked: boolean}[]}
) => {
    const createStore = useCreateStore()

    let languages = createStore.createData[name].languages_and_technologies

    if (!languages.length) return

    technologies.value = technologies.value?.map(el => {
        if (languages.includes(el.title)) {
            return {
                title: el.title,
                checked: true,
            }
        }

        return el
    })
}

// если изменился список языков, то добавить в нужный элемент list
export const setNewLanguages = (
    name: string,
    technologies: {value: {title: string, checked: boolean}[]}
) => {
    const onlineStore = useOnlineStore()
    const itemsStore = useItemsStore()
    const createStore = useCreateStore()

    if (!onlineStore.isOnlineMode) return

    const redactLanguages: string[] = Object.values(createStore.createData[name].languages_and_technologies)
    const filteredLanguages = technologies.value
        ?.filter(el => el.checked)
        ?.map(el => el.title)

    if (redactLanguages !== filteredLanguages) {
        itemsStore.items[name] = itemsStore.items[name]?.map(el => {
            if (el.id === createStore.createData[name].id) {
                return {
                    ... el,
                    languages_and_technologies: filteredLanguages,
                }
            }

            return el
        })
    }
}
//=========================================================//


//=========================================================//
//-- поля ввода --//
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
//=========================================================//


//=========================================================//
//-- кнопки действий --//
// закрытие блока создания
export const back = (
    name: string,
    type: string = 'no_textbooks'
) => {
    const blocksStore = useBlocksStore()
    const settingsStore = useSettingsStore()
    const createStore = useCreateStore()

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

// клик по кнопке "Отмена"
export const handleBack = async (
    name: string,
): Promise<void> => {
    const userStore = useUserStore()
    const blocksStore = useBlocksStore()
    const createStore = useCreateStore()

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
//-- конвертация --//
// конвертация текста в блоки (при редактировании записи)
export const convertTextToBlocks = (str: string): { type: string, text: string }[] => {
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
export const convertBlocksToText = (blocks: { type: string, text: string }[]): string => {
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
//-- хуки --//
// получаем список всевозможных языков и технологий, чтобы отобразить их с checkbox
export const getTechnologies = (
    technologies: {value: {title: string, checked: boolean}[]},
    func: Function,
    name: string
) => {
    const technologiesStore = useTechnologiesStore()

    technologiesStore.technologies?.forEach(el => {
        technologies.value.push({
            title: el,
            checked: false
        })
    })

    func()

    getSearchTechnologies(name, technologies)
}
//=========================================================//