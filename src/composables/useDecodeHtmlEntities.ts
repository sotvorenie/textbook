const decodeHtmlEntities = (text: string): string => {
    return text
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/<span class="item__comment">.*?<\/span>/g, ''); // удаляем HTML теги
};

export default decodeHtmlEntities