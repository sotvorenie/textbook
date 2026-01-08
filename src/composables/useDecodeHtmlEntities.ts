const decodeHtmlEntities = (text: string): string => {
    return text
        .replaceAll('&#39;', "'")
        .replaceAll('&quot;', '"')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replaceAll('&amp;', '&')
        .replaceAll(/<span class="item__comment">.*?<\/span>/g, ''); // удаляем HTML теги
}

export default decodeHtmlEntities