import { onMounted, ref } from "vue";

export function useTheme() {
    const theme = ref<string>('dark')

    const setTheme = () => {
        document.documentElement.dataset.theme = theme.value
    }

    const changeTheme = () => {
        theme.value = theme.value === 'dark' ? 'light' : 'dark'
        setTheme()
        localStorage.setItem('theme', theme.value)
    }

    const getTheme = () => {
        theme.value = localStorage.getItem('theme') ?? 'dark'
        setTheme()
    }

    onMounted(() => {
        getTheme()
    })

    return {
        theme,
        changeTheme,
        getTheme
    }
}