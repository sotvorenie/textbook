import {onMounted, ref} from "vue";

const theme = ref<string>('dark');

const changeTheme = () => {
    theme.value === 'dark' ? theme.value = 'light' : theme.value = 'dark';

    setTheme();

    localStorage.setItem('theme', theme.value);
}

const setTheme = () => {
    document.documentElement.setAttribute('data-theme', theme.value);
}

const getTheme = () => {
    theme.value = localStorage.getItem('theme') ?? '';

    setTheme();
}

onMounted(() => {
    getTheme();

})

export { changeTheme, theme, getTheme }