export const ImageProps = ['setup', 'run', 'interrupt', 'wake', 'kill'];

export default interface Image {
    setup?: () => any;
    run?: () => any;
    interrupt?: (interrupt: number, interrupt_type: string, signal?: any) => any;
    wake?: (interrupt: number, interrupt_type: string) => any;
    kill?: (e?: any) => any;
}
