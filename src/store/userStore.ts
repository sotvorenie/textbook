import {defineStore} from "pinia";
import {reactive, ref} from "vue";

import { User } from "../types/user";

const useUserStore = defineStore('userStore', () => {

    const user: User = reactive({
        email: "",
        name: "",
        id: -1
    })

    const userLiked = ref();

    const isAdmin = ref<boolean>(false)
    const isFullAdmin = ref<boolean>(false)

    const lastSession = ref<string>('')

    const setUser = (value: User): void => {
        user.email = value.email;
        user.id = value.id;
        user.name = value.name;

        localStorage.setItem('user', JSON.stringify(user));
    }

    return {
        user,
        userLiked,
        isAdmin,
        isFullAdmin,
        lastSession,

        setUser
    }
})

export default useUserStore;