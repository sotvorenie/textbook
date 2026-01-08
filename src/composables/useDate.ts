export const formatTime = (date: Date = new Date()): string => {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export const formatDate = (date: Date = new Date()): string => {
    return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`
}

export const formatSortableDate = (date: Date = new Date()): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export const getCurrentDateTime = () => {
    const now = new Date()
    return {
        time: formatTime(now),
        date: formatDate(now),
        sort_date: formatSortableDate(now)
    }
}