function getParent(event: Event) {
    let target: HTMLElement = event.target as HTMLElement;

    let parent: HTMLLabelElement | null = target.closest('label');

    if (!parent) return;

    return parent;
}

function addLabelText(event: Event) {
    getParent(event)?.querySelector('.label__text')?.classList.add('is-active');
}

function removeLabelText(event: Event) {

    let parent: HTMLLabelElement | null = getParent(event) as HTMLLabelElement;

    let input: HTMLInputElement | HTMLTextAreaElement | null =
        parent?.querySelector('input, textarea');

    if (!input?.value) parent?.querySelector('.label__text')?.classList.remove('is-active');
}


export { addLabelText, removeLabelText };