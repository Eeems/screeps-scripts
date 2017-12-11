export const DeviceProps = ['setup', 'run', 'interrupt', 'wake', 'kill'];

export default interface Device {
    register: (id) => void;
    remove: (id) => void;
    has: (id) => boolean;
    open: (id) => any;
    save: (id?) => void;
}
