import Widget from "../widget/widget.tsx";
import {IWidgetArgs, IWidgetType} from "../widget/widgetInterface.ts";
import icon_BUILTIN_VARIABLE from '../../assets/icon_BUILTIN_VARIABLE.png'

class BUILTIN_VARIABLE extends Widget {
	constructor(arg: IWidgetArgs) {
		super(arg);
	}

	widgetType(): IWidgetType {
		let widgetType = super.widgetType();
		widgetType.type = 'BUILTIN_VARIABLE';
		widgetType.name = '变量';
		widgetType.icon = icon_BUILTIN_VARIABLE;
		// 经过以下设置，则可成为不可见控件
		widgetType.invisible = true;
		widgetType.category = 'feature';
		widgetType.advanced.noDxFlyout = true;
		widgetType.color = '#ffbc58'
		return widgetType;
	}
	render(): JSX.Element {
		return <div></div>;
	}
}

export default BUILTIN_VARIABLE;