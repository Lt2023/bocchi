import Widget from "../widget/widget.tsx";
import {IWidgetArgs, IWidgetType} from "../widget/widgetInterface.ts";
import icon_BUILTIN_OBJECT from '../../assets/icon_BUILTIN_OBJECT.png'

class BUILTIN_OBJECT extends Widget {
    constructor(arg: IWidgetArgs) {
        super(arg);
    }

    widgetType(): IWidgetType {
        let widgetType = super.widgetType();
        widgetType.type = 'BUILTIN_OBJECT';
        widgetType.name = '对象';
        widgetType.icon = icon_BUILTIN_OBJECT;
        // 经过以下设置，则可成为不可见控件
        widgetType.invisible = true;
        widgetType.category = 'feature';
        widgetType.advanced.noDxFlyout = true;
        widgetType.color = '#a67bff'

        return widgetType;
    }
    render(): JSX.Element {
        return <div></div>;
    }
}
export default BUILTIN_OBJECT;