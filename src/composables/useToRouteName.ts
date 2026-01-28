const toRouteName = (block: string) => {
    return block.charAt(0).toUpperCase() + block.slice(1);
}

export default toRouteName