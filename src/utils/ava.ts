import useUserStore from "../store/useUserStore.ts";

export const userAva = {
    set() {
        const userStore = useUserStore();

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
    },
    remove() {
        localStorage.setItem('ava', '{}')
    }
}