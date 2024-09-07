import Widget from "../widget/widget.tsx";
import {IWidgetArgs, IWidgetType} from "../widget/widgetInterface.ts";
import icon_BUILTIN_EVENT from '../../assets/icon_BUILTIN_EVENT.png'

class BUILTIN_EVENT extends Widget {
    constructor(arg: IWidgetArgs) {
        super(arg);
    }

    widgetType(): IWidgetType {
        let widgetType = super.widgetType();
        widgetType.type = 'BUILTIN_EVENT';
        widgetType.name = '事件';
        widgetType.icon = icon_BUILTIN_EVENT;
        widgetType.color = '#7790f9';
        // 经过以下设置，则可成为不可见控件
        widgetType.invisible = true;
        widgetType.category = 'feature';
        widgetType.advanced.noDxFlyout = true;

        return widgetType;
    }
    render(): JSX.Element {
        return <div></div>;
    }
}

export default BUILTIN_EVENT;