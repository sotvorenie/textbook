import {defineStore} from "pinia";
import {ref} from "vue";

const useMessageStore = defineStore("messageStore", () => {

    // видимость блока message
    const isVisible = ref<boolean>(false)

    // текст сообщения
    const text = ref<string>("")

    // внешний вид: ошибка или нет
    const isError = ref<boolean>(false)

    // показ блока сообщения
    const show = (message: string, isErr: boolean = false) => {
        text.value = message
        isError.value = isErr
        isVisible.value = true
    }

    return {
        isVisible,
        text,
        isError,

        show,
    }
})

export default useMessageStore