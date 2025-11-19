import { createApp } from "vue";
import {createPinia} from "pinia";
import router from "./router";
import App from "./App.vue";
import {openDB, initDB} from "./api/database";

const start = async () => {
    const app = createApp(App);

    app.directive('autofocus', {
        mounted (el) {
            el.focus()
        }
    })

    app.use(createPinia());

    await openDB()
    await initDB()

    app.use(router);
    app.mount("#app");
}

await start()
