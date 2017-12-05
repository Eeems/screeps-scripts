export default interface Image {
    next?: () => Iterator<any>;
    interrupt?: () => Iterator<any>;
    wake?: () => Iterator<any>;
    kill?: () => Iterator<any>;
}
