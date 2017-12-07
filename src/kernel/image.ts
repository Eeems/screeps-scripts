export const ImageProps = ['setup', 'run', 'interrupt', 'wake', 'kill'];

export default interface Image {
    setup?: () => any;
    run?: () => any;
    interrupt?: (interrupt: number, interrupt_type: number, signal?: any) => any;
    wake?: (interrupt: number, interrupt_type: number) => any;
    kill?: (e?: any) => any;
}
