import useUserStore from "../store/useUserStore.ts";

export const userAva = {
    set() {
        const userStore = useUserStore();

        localStorage.setItem('ava', JSON.stringify(userStore.user.ava));
    },
    get() {
        try {
            return JSON.parse(localStorage.getItem('ava') ?? '{}');
        } catch {
            return {};
        }
    },
    remove() {
        localStorage.setItem('ava', '{}')
    }
}