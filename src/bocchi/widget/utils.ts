import {IWidgetMethod, IWidgetType} from "./widgetInterface.ts";

export function getMethodBlockType(widgetType: IWidgetType, widgetMethod: IWidgetMethod): string {
    let startText = "";
    if (widgetMethod.noWidgetNameSelect) {
        startText = "NONAME_"
    }
    return `${startText}METHOD_${widgetType.type}_M_${widgetMethod.key}`;
}