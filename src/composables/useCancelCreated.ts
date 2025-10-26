import {showConfirm} from "../utils/modals.ts";

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