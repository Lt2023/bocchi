type Color = 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'error' | 'group' | 'groupEnd';

const COLORS: Color[] = ['primary', 'success', 'info', 'warning', 'danger', 'error', 'group', 'groupEnd'];

const COLOR_MAP: Record<Color, string> = {
    primary: '#2d8cf0',
    success: '#19be6b',
    info: '#909399',
    warning: '#ff9900',
    danger: '#35495E',
    error: "#FF0000",
    group: '#ef78ef',
    groupEnd: '#ef78ef',
};

const getColor = (type: Color) => COLOR_MAP[type];

const createLog = <T extends any[]>(
    fn: (type: Color, ...args: T) => void
): Record<Color, (...args: T) => void> => {
    return COLORS.reduce((logs, type) => {
        logs[type] = (...args: T) => fn(type, ...args);
        return logs;
    }, {} as Record<Color, (...args: T) => void>);
};

const bocchiLog = (type: Color, ns: string, msg: string, ...args: any[]) => {
    const color = getColor(type);
    if (type === 'group') {
        console.group(
            `%c ${ns} %c ${msg} %c ${args.length ? '%o' : ''}`,
            `background:${color};border:1px solid ${color}; padding: 1px; border-radius: 4px 0 0 4px; color: #fff;`,
            `border:1px solid ${color}; padding: 1px; border-radius: 0 4px 4px 0; color: ${color};`,
            'background:transparent',
            ...args,
            //'\n' + (new Error().stack || "").split("\n").slice(3).join('\n')
            //'\n' + (new Error().stack || "").split("\n")[3]
        );
    }
    else if (type === 'groupEnd') {
        console.groupEnd();
    }
    else if (type === 'info') {
        console.debug(
            `%c ${ns} %c ${msg} %c ${args.length ? '%o' : ''}`,
            `background:${color};border:1px solid ${color}; padding: 1px; border-radius: 4px 0 0 4px; color: #fff;`,
            `border:1px solid ${color}; padding: 1px; border-radius: 0 4px 4px 0; color: ${color};`,
            'background:transparent',
            ...args,
            '\n' + (new Error().stack || "").split("\n").slice(3).join('\n')
            //'\n' + (new Error().stack || "").split("\n")[3]
        );
    } else if (type === 'primary' || type === "success") {
        console.log(
            `%c ${ns} %c ${msg} %c ${args.length ? '%o' : ''}`,
            `background:${color};border:1px solid ${color}; padding: 1px; border-radius: 4px 0 0 4px; color: #fff;`,
            `border:1px solid ${color}; padding: 1px; border-radius: 0 4px 4px 0; color: ${color};`,
            'background:transparent',
            ...args,
            //'\n' + (new Error().stack || "").split("\n").slice(3).join('\n')
            //'\n' + (new Error().stack || "").split("\n")[3]
        );
    } else if (type === 'warning' || type === 'danger') {
        console.warn(`%c ${ns} %c ${msg} %c ${args.length ? '%o' : ''}`,
            `background:${color};border:1px solid ${color}; padding: 1px; border-radius: 4px 0 0 4px; color: #fff;`,
            `border:1px solid ${color}; padding: 1px; border-radius: 0 4px 4px 0; color: ${color};`,
            'background:transparent',
            ...args,
            //'\n' + (new Error().stack || "").split("\n").slice(3).join('\n')
            //'\n' + (new Error().stack || "").split("\n")[3]
        )
    } else {
        console.error(`%c ${ns} %c ${msg} %c ${args.length ? '%o' : ''}`,
            `background:${color};border:1px solid ${color}; padding: 1px; border-radius: 4px 0 0 4px; color: #fff;`,
            `border:1px solid ${color}; padding: 1px; border-radius: 0 4px 4px 0; color: ${color};`,
            'background:transparent',
            ...args,
            //'\n' + (new Error().stack || "").split("\n").slice(3).join('\n')
            //'\n' + (new Error().stack || "").split("\n")[3]
        )
    }
};
const error = console.error;
console.error = (...arg) => {
    // 对于一些error，我们已经知道，此处予以忽略
    const ignoreErr: string[] = [
        ' is deprecated',
        "Warning: ReactDOM.render",
        //TODO 这个什么bug啊啊啊啊我不会react 错误出自contextMenu.ts
        'Warning: Render method'
    ];
    let ignore = false;
    ignoreErr.map((e) => {
        if (arg.toString().includes(e)) ignore = true;
    })
    if (ignore) {
        return;
    }

    error(...arg);
}
export const logger = createLog(bocchiLog);