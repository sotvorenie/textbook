import Info from "../assets/icons/menu/Info.vue";
import Book from "../assets/icons/menu/Book.vue";
import Project from "../assets/icons/menu/Project.vue";
import Help from "../assets/icons/menu/Help.vue";
import Letter from "../assets/icons/menu/Letter.vue";
import Blog from "../assets/icons/menu/Blog.vue";

const menuItems: Array<{id: number; [key: string]: any}> = [
    {
        id: 1,
        name: 'Полезное',
        icon: Info
    },
    {
        id: 2,
        name: 'Учебники',
        icon: Book
    },
    {
        id: 3,
        name: 'Проекты',
        icon: Project
    },
    {
        id: 4,
        name: 'Советы',
        icon: Help
    },
    {
        id: 5,
        name: 'Мессенджер',
        icon: Letter
    },
    {
        id: 6,
        name: 'Блог',
        icon: Blog
    },
]

export {menuItems}