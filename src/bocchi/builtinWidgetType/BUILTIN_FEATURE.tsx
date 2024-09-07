import Widget from "../widget/widget.tsx";
import {IWidgetArgs, IWidgetType} from "../widget/widgetInterface.ts";
import icon_BUILTIN_FEATURE from '../../assets/icon_BUILTIN_FEATURE.png'

class BUILTIN_FEATURE extends Widget {
    constructor(arg: IWidgetArgs) {
        super(arg);
    }

    widgetType(): IWidgetType {
        let widgetType = super.widgetType();
        widgetType.type = 'BUILTIN_FEATURE';
        widgetType.name = '功能';
        widgetType.color = '#1ab7c9'

        widgetType.icon = icon_BUILTIN_FEATURE;
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

export default BUILTIN_FEATURE;