export const sliceString = (str: string, value: number): string => {
    return `${str.slice(0, value).trim()}${str.length <= value ? "" : ".."}`
}