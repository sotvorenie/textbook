import {showConfirm} from "../utils/modals.ts";

export const names: Record<string, string> = {
    hints: 'подсказки',
    textbooks: 'учебника',
    projects: 'проекта',
    advices: 'совета',
}

export const cancel = async (name: string, back: Function) => {
    const confirm = await showConfirm(
        'Отмена создания подсказки',
        `Вы действительно хотите отменить создание ${name}?`
    )

    if (confirm) back()
}