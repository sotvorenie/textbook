import {defineStore} from "pinia";
import {ref} from "vue";

const useRouterStore = defineStore("routerStore", () => {
    // была ли предыдущая страница - страницей User
    const isUser = ref<boolean>(false)

    return {
        isUser,
    }
})

export default useRouterStore