import Widget from "../widget/widget.tsx";
import {IWidgetArgs, IWidgetType} from "../widget/widgetInterface.ts";
import {deepCopy} from "dooringx-lib";
import icon_BUILTIN_SCREEN from '../../assets/icon_BUILTIN_SCREEN.png'

class BUILTIN_SCREEN extends Widget {
    constructor(arg: IWidgetArgs) {
        super(arg);
        this.oldScreenWidth = 375;
        this.oldScreenHeight = 667;
    }

    public oldScreenWidth: number;
    public oldScreenHeight: number;

    widgetType(): IWidgetType {
        let widgetType = super.widgetType();
        widgetType.type = 'BUILTIN_SCREEN';
        widgetType.name = '屏幕';
        widgetType.icon = icon_BUILTIN_SCREEN;
        widgetType.emit.push({
            key: "onScreenOpen",
            label: "屏幕打开",
            params: [],
        })
        widgetType.methods.push({
            key: "log",
            label: "日志",
            params: [
                {
                    key: 'v',
                    label: '',
                    valueType: 'string',
                    defaultValue: 'Hello world!',
                }
            ]
        })
        widgetType.methods.push({
            key: "math",
            label: "",
            params: [
                {
                    key: 'v1',
                    label: '',
                    valueType: 'number',
                    defaultValue: 1,
                },
                {
                    key: 'mode',
                    label: '',
                    valueType: 'string',
                    dropdown: [
                        ['+', '+']
                    ]
                },
                {
                    key: 'v2',
                    label: '',
                    valueType: 'number',
                    defaultValue: 1,
                }
            ],
            valueType: "number",
            noWidgetNameSelect: true,
            tipBefore: "\u200E",
            tipAfter: "\u200E",
        })
        widgetType.methods.push({
            key: "toString",
            label: "到字符串",
            params: [
                {
                    key: 'v',
                    label: '',
                    valueType: 'number',
                    defaultValue: 1,
                }
            ],
            valueType: "string",
            noWidgetNameSelect: true,
            tipBefore: "\u200E",
            tipAfter: "\u200E",
        })
        widgetType.methods.push({
            key: "toNumber",
            label: "到数字",
            params: [
                {
                    key: 'v',
                    label: '',
                    valueType: 'string',
                    defaultValue: '1',
                }
            ],
            valueType: "number",
            noWidgetNameSelect: true,
            tipBefore: "\u200E",
            tipAfter: "\u200E",
        })
        widgetType.props.push({
            key: "screenWidth",
            label: "屏幕宽度",
            valueType: 'number',
            defaultValue: 375,
            //noBlock: true,
        })
        this.oldScreenWidth = 375;
        widgetType.props.push({
            key: "screenHeight",
            label: "屏幕高度",
            valueType: 'number',
            defaultValue: 667,
            //noBlock: true,
        })
        this.oldScreenHeight = 667;
        widgetType.invisible = true;
        return widgetType;
    }

    __onEditorFreshWidgetsProps(props: Record<string, any>) {
        //TODO 卡卡的
        console.log('eee');
        if (!this.__config) return;
        let data = this.__config.getStore().getData();
        if(this.oldScreenHeight!==props.screenHeight || this.oldScreenWidth!==props.screenWidth){
           this.oldScreenHeight =props.screenHeight;
           data.container.height = props.screenHeight;
            this.oldScreenWidth =props.screenWidth;
            data.container.width = props.screenWidth;
            this.__config.getStore().setData(deepCopy(data));
        }
        if(props.screenHeight!==data.container.height){
            this.__setProp('screenHeight',data.container.height);
            this.oldScreenHeight = props.screenHeight;
        }
    }

    __onPlayerFreshWidgetsProp(key: string, value: any) {
        if (!this.__config) return;
        let data = this.__config.getStore().getData();
        if (key === 'screenWidth') {
            data.container.width = value;
            this.__config.getStore().setData(deepCopy(data));
        }
        if (key === 'screenHeight') {
            data.container.height = value;
            this.__config.getStore().setData(deepCopy(data));
        }
    }

    async __onPlayerReady() {
        super.__onPlayerReady();
        this.emit('onScreenOpen');
    }

    log(v: string) {
        console.log(v);
    }

    math(v1: number, mode: string, v2: number) {
        switch (mode) {
            case '+':
                return v1 + v2;
        }
        return NaN;
    }

    toString(v1: number) {
        return v1.toString();
    }

    toNumber(v1: string) {
        return Number(v1);
    }

    render(): JSX.Element {
        return <div></div>;
    }
}

export default BUILTIN_SCREEN;