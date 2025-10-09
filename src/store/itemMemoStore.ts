import {defineStore} from "pinia";

import {LRUCache} from "lru-cache";

import {Item} from "../types/item.ts";

const MAX_ITEMS = 10;
const MAX_BYTES = 1024 * 1024 // ~ 1 Мб

function roughSizeOfObject(object: any): number {
    const objectList = new WeakSet();
    const stack = [object];
    let bytes = 0;

    while (stack.length) {
        const value = stack.pop();

        if (value === null || value === undefined) continue;

        const type = typeof value;

        if (type === 'boolean') bytes += 4;
        else if (type === 'number') bytes += 8;
        else if (type === 'string') bytes += value.length * 2;
        else if (type === 'object') {
            if (objectList.has(value)) continue;
            objectList.add(value);

            for (const i in value) {
                stack.push(value[i]);
            }
        }
    }

    return bytes;
}

const useItemMemoStore = defineStore('itemMemoStore', () => {

    // const items = reactive<Record<string, Map<number, Item>>>({
    //     hints: new Map(),
    //     advices: new Map(),
    //     projects: new Map(),
    //     textbooks: new Map(),
    // })

    // const getItem = (name: string, id: number): Item | undefined => {
    //     return items[name].get(id);
    // }
    //
    // const setItem = (name: string, id: number, value: Item): void => {
    //     items[name].set(id, value);
    // }

    const caches: Record<string, LRUCache<number, Item>> = {
        hints: new LRUCache({
            max: MAX_ITEMS,
            maxSize: MAX_BYTES,
            sizeCalculation: roughSizeOfObject
        }),
        advices: new LRUCache({
            max: MAX_ITEMS,
            maxSize: MAX_BYTES,
            sizeCalculation: roughSizeOfObject
        }),
        projects: new LRUCache({
            max: MAX_ITEMS,
            maxSize: MAX_BYTES,
            sizeCalculation: roughSizeOfObject
        }),
        textbooks: new LRUCache({
            max: MAX_ITEMS,
            maxSize: MAX_BYTES,
            sizeCalculation: roughSizeOfObject
        }),
    };

    const getItem = (name: string, id: number): Item | undefined => {
        const cache = caches[name];
        if (!cache) return undefined;

        const item = cache.get(id);
        if (item) {
            cache.set(id, item);
        }

        return item;
    }

    const setItem = (name: string, id: number, value: Item): void => {
        caches[name]?.set(id, value);
    }

    const resetStore = () => {
        for (const key of Object.keys(caches)) {
            caches[key].clear();
        }
    }

    const getLastFromCache = (cacheName: string): { key: number; value: Item } | null => {
        const cache = caches[cacheName];
        if (!cache) return null;

        const entries = Array.from(cache.entries());
        if (entries.length === 0) return null;

        const [key, value] = entries[0];
        return { key, value };
    };

    const updateLastItemInCache = (cacheName: string, newValue: Partial<Item>) => {
        const last = getLastFromCache(cacheName);
        if (!last) return;

        const updated = { ...last.value, ...newValue };
        caches[cacheName].set(last.key, updated);
    };

    // const resetStore = () => {
    //     items.hints = new Map()
    //     items.advices = new Map()
    //     items.projects = new Map()
    //     items.textbooks = new Map()
    // }

    return {
        caches,

        getItem,
        setItem,
        getLastFromCache,
        updateLastItemInCache,

        resetStore,
    }
})

export default useItemMemoStore;