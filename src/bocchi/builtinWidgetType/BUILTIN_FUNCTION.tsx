import Widget from "../widget/widget.tsx";
import {IWidgetArgs, IWidgetType} from "../widget/widgetInterface.ts";
import icon_BUILTIN_FUNCTION from '../../assets/icon_BUILTIN_FUNCTION.png'

class BUILTIN_FUNCTION extends Widget {
    constructor(arg: IWidgetArgs) {
        super(arg);
    }

    widgetType(): IWidgetType {
        let widgetType = super.widgetType();
        widgetType.type = 'BUILTIN_FUNCTION';
        widgetType.name = '函数';
        widgetType.icon = icon_BUILTIN_FUNCTION;
        // 经过以下设置，则可成为不可见控件
        widgetType.invisible = true;
        widgetType.category = 'feature';
        widgetType.advanced.noDxFlyout = true;
        widgetType.color = '#f78767'

        return widgetType;
    }
    render(): JSX.Element {
        return <div></div>;
    }
}

export default BUILTIN_FUNCTION;