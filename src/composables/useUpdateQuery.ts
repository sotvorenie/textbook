import { useRoute, useRouter } from 'vue-router'
import { debounce } from '../utils/debounce'

export const useQueryUpdater = () => {
    const route = useRoute()
    const router = useRouter()

    const updateQuery = async (patch: Record<string, any>) => {
        await router.replace({
            query: {
                ...route.query,
                ...patch
            }
        })
    }

    const debouncedUpdateQuery = debounce(
        async (query: Record<string, any>) => {
            await updateQuery(query)
        },
        500
    )

    return {
        updateQuery,
        debouncedUpdateQuery
    }
}