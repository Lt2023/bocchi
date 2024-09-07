import Widget from "../widget/widget.tsx";
import {IWidgetArgs, IWidgetType} from "../widget/widgetInterface.ts";
import icon_BUILTIN_OPERATION from '../../assets/icon_BUILTIN_OPERATION.png'

class BUILTIN_OPERATION extends Widget {
    constructor(arg: IWidgetArgs) {
        super(arg);
    }

    widgetType(): IWidgetType {
        let widgetType = super.widgetType();
        widgetType.type = 'BUILTIN_OPERATION';
        widgetType.name = '运算';
        widgetType.icon = icon_BUILTIN_OPERATION;
        // 经过以下设置，则可成为不可见控件
        widgetType.invisible = true;
        widgetType.category = 'feature';
        widgetType.advanced.noDxFlyout = true;
        widgetType.color = '#ff9364'

        return widgetType;
    }
    render(): JSX.Element {
        return <div></div>;
    }
}

export default BUILTIN_OPERATION;