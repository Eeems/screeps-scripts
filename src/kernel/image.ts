export const ImageProps = ['setup', 'next', 'interrupt', 'wake', 'kill'];

export default interface Image {
    setup?: () => Iterator<any>;
    next?: () => Iterator<any>;
    interrupt?: () => Iterator<any>;
    wake?: () => Iterator<any>;
    kill?: () => Iterator<any>;
}
