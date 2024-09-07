import Widget from "../widget/widget.tsx";
import {IWidgetArgs, IWidgetType} from "../widget/widgetInterface.ts";
import icon_BUILTIN_CONTROL from '../../assets/icon_BUILTIN_CONTROL.png'

class BUILTIN_CONTROL extends Widget {
    constructor(arg: IWidgetArgs) {
        super(arg);
    }

    widgetType(): IWidgetType {
        let widgetType = super.widgetType();
        widgetType.type = 'BUILTIN_CONTROL';
        widgetType.name = '控制';
        widgetType.icon = icon_BUILTIN_CONTROL;
        // 经过以下设置，则可成为不可见控件
        widgetType.invisible = true;
        widgetType.category = 'feature';
        widgetType.advanced.noDxFlyout = true;
        widgetType.color = '#14b3ff'
        widgetType.methods.push({
            key: "for_circulate",
            label: "循环",
            params: [
                {
                    key: 'begin',
                    label: '从',
                    valueType: 'number',
                    defaultValue: 0
                },
                {
                    key: 'end',
                    label: '到',
                    valueType: 'number',
                    defaultValue: 100
                },
                {
                    key: 'step',
                    label: ', 间隔',
                    valueType: 'number',
                    defaultValue: 1
                },
                {
                    key: 'code',
                    label: ' ',
                    valueType: 'code',
                    codeParams: [
                        {
                            key: 'i',
                            label: '循环变量',
                            valueType: 'number'
                        }
                    ]
                }
            ],
            noWidgetNameSelect: true
        });
        widgetType.methods.push({
            key: "break_circulate",
            label: "跳出循环",
            params: [],
            noWidgetNameSelect: true,
            noNs: true
        });
        widgetType.methods.push({
            key: "wait_ms",
            label: "等待",
            params: [
                {
                    key: 'ms',
                    label: '毫秒数',
                    valueType: 'number',
                    defaultValue: 100
                },
            ],
            noWidgetNameSelect: true
        });
        return widgetType;
    }

    async wait_ms(ms: number) {
        const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay));
        await sleep(ms);
    }

    async for_circulate(begin: number, end: number, step: number, code: (i: number) => void) {
        function sleep(ms: number) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        for (let i = begin; i < end; i += step) {
            await sleep(10);
            try {
                await code(i);
            } catch (e: any) {
                if (e.message === 'BOCCHI_BREAK_CIRCULATE')
                    break;
                else throw e;
            }
        }
    }

    break_circulate() {
        throw Error('BOCCHI_BREAK_CIRCULATE');
    }

    render(): JSX.Element {
        return <div></div>;
    }
}

export default BUILTIN_CONTROL;