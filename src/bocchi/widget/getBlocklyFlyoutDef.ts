import {IWidgetMethod, IWidgetType} from "./widgetInterface.ts";
import {getMethodBlockType} from "./utils.ts";

function getBlocklyInputs(method: IWidgetMethod, widgetType: IWidgetType) {
    let inputs: any = {};
    method.params.map((param) => {
        if (param.valueType == "code") {
            if (param.codeParams) {
                param.codeParams.map((codeParam) => {
                    inputs[`CODE_PARAM_${param.key}_${codeParam.key}`] = {
                        "block": {
                            "type": `CODE_PARAM_BLOCK_${widgetType.type}_${method.key}_${param.key}_${codeParam.key}`,
                        }
                    }
                })
            }
        }
        if (param.valueType === 'string' && !param.dropdown) {
            inputs[param.key] = {
                "shadow": {
                    "type": "text",
                    "fields": {
                        "TEXT": param.defaultValue || ""
                    }
                }
            };
        }
        if (param.valueType === 'number' && !param.dropdown) {
            inputs[param.key] = {
                "shadow": {
                    "type": "math_number",
                    "fields": {
                        "NUM": param.defaultValue || 0
                    }
                }
            };
        }
    });

    return inputs;
}


function getBlocklyFlyoutDef(widgetType: IWidgetType, key: string) {
    const methods = widgetType.methods;
    let flyout: any[] = [];
    methods.map(method => {
        let methodFlyout: any = {
            kind: 'block',
            type: getMethodBlockType(widgetType, method),
            inputs: getBlocklyInputs(method, widgetType),
            fields: {}
        }
        if (!method.noWidgetNameSelect) {
            methodFlyout["fields"]['WIDGET_ID'] = key;
        }
        flyout.push(
            methodFlyout
        );

        // method.params.map((param) => {
        //     param.codeParams?.map((cp) => {
        //         flyout.push({
        //             kind: 'block',
        //             type: `CODE_PARAM_BLOCK_${widgetType.type}_${param.key}_${cp.key}`,
        //             fields: {}
        //         })
        //     })
        // })
    });

    return flyout;
}

export default getBlocklyFlyoutDef;