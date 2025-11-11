import { createApp } from "vue";
import {createPinia} from "pinia";
import router from "./router";
import App from "./App.vue";
import {openDB, initDB} from "./api/database";

const start = async () => {
    try {
        await openDB()
        await initDB()
    } catch (error) {
        console.error("❌ Ошибка при инициализации базы данных:", error);
    }

    const app = createApp(App);

    app.directive('autofocus', {
        mounted (el) {
            el.focus()
        }
    })

    app.use(createPinia());
    app.use(router);
    app.mount("#app");
}

await start()
