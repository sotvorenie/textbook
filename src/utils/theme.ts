import {onMounted, ref} from "vue";

const theme = ref<string>('dark')

const changeTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'

    setTheme()

    localStorage.setItem('theme', theme.value)
}

const setTheme = () => {
    document.documentElement.dataset.theme = theme.value
}

const getTheme = () => {
    theme.value = localStorage.getItem('theme') ?? ''

    setTheme()
}

onMounted(() => {
    getTheme()

})

export { changeTheme, theme, getTheme }