import useUserStore from "../../store/userStore.ts";
import useOnlineStore from "../../store/useOnlineStore.ts";

const bot_token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
const chat_id = import.meta.env.VITE_TELEGRAM_CHAT_ID

export enum TelegramEventType {
    NEW_SESSION = 'NEW_SESSION',
    LOGIN = 'LOGIN',
    REGISTER = 'REGISTER',
    CREATE_HINTS = 'CREATE_HINTS',
    CREATE_TEXTBOOKS = 'CREATE_TEXTBOOKS',
    CREATE_PROJECTS = 'CREATE_PROJECTS',
    CREATE_ADVICES = 'CREATE_ADVICES',
    LIKE = 'LIKE',
    UNLIKE = 'UNLIKE',
    LOAD_AVA = 'LOAD_AVA',
}

export const sendToTelegram = async (eventType: TelegramEventType, title?: string): Promise<void> => {
    const userStore = useUserStore();
    const onlineStore = useOnlineStore();

    try {
        if (!userStore.isViewer || !onlineStore.isOnlineMode) return

        const messages = {
            [TelegramEventType.NEW_SESSION]: `🚪 Пользователь "${userStore.user.name}" зашел в приложение`,
            [TelegramEventType.LOGIN]: `🔐 Пользователь "${title}" авторизовался в приложении`,
            [TelegramEventType.REGISTER]: `🔑 Пользователь "${title}" зарегистрировался в приложении`,
            [TelegramEventType.CREATE_HINTS]: `❕ Пользователь "${userStore.user.name}" создал подсказку - "${title}"`,
            [TelegramEventType.CREATE_TEXTBOOKS]: `📙 Пользователь "${userStore.user.name}" создал учебник - "${title}"`,
            [TelegramEventType.CREATE_PROJECTS]: `🌐 Пользователь "${userStore.user.name}" создал проект - "${title}"`,
            [TelegramEventType.CREATE_ADVICES]: `✨ Пользователь "${userStore.user.name}" создал совет - "${title}"`,
            [TelegramEventType.LIKE]: `♥️ Пользователь "${userStore.user.name}" лайкнул "${title}"`,
            [TelegramEventType.UNLIKE]: `💔 Пользователь "${userStore.user.name}" убрал лайк у "${title}"`,
            [TelegramEventType.LOAD_AVA]: `🖼️ Пользователь "${userStore.user.name}" загрузил новую аватарку - "${title}"`,
        };

        const message = messages[eventType];

        await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chat_id,
                text: message,
                parse_mode: 'HTML'
            })
        });
    } catch (_) {
        return
    }
}