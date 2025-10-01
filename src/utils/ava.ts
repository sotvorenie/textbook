import useUserStore from "../store/userStore.ts";
const userStore = useUserStore();

export const userAva = {
    set() {
        localStorage.setItem('ava', JSON.stringify(userStore.user.ava));
    },
    get() {
        try {
            const item = localStorage.getItem('ava');
            if (!item || item === 'null' || item === 'undefined') {
                return {};
            }
            return JSON.parse(item);
        } catch (error) {
            return {};
        }
    }
}