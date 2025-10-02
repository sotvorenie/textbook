import {defineStore} from "pinia";
import {reactive, ref} from "vue";

import { User } from "../types/user";

const useUserStore = defineStore('userStore', () => {

    const user: User = reactive({
        email: "",
        name: "",
        id: -1
    })

    const userLiked = reactive<{
        id: number,
        items: Record<string, number[]>,
        user_id: string
    }>({
        id: -1,
        items: {
            hints: [],
            advices: [],
            projects: [],
            textbooks: [],
        },
        user_id: "-1"
    });

    const isAdmin = ref<boolean>(false)
    const isFullAdmin = ref<boolean>(false)
    const isViewer = ref<boolean>(true)

    const lastSession = ref<string>('')

    const setUser = (value: User): void => {
        user.email = value.email;
        user.id = value.id;
        user.name = value.name;

        localStorage.setItem('user', JSON.stringify(user));
    }

    const resetStore = () => {
        user.email = ""
        user.name = ""
        user.id = -1

        userLiked.id = -1
        userLiked.user_id = "-1"
        userLiked.items.hints = []
        userLiked.items.advices = []
        userLiked.items.projects = []
        userLiked.items.textbooks = []


        isAdmin.value = false
        isFullAdmin.value = false
        isViewer.value = true

        lastSession.value = ''
    }

    return {
        user,
        userLiked,
        isAdmin,
        isFullAdmin,
        lastSession,
        isViewer,

        setUser,

        resetStore,
    }
})

export default useUserStore;