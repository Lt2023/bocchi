import {IWidgetType} from "./widgetInterface.ts";
import {createPannelOptions} from "dooringx-lib";
import {InputMap} from "../porpsFormComponents/input.tsx";
import {NumberInputMap} from "../porpsFormComponents/numberInput.tsx";

function getDooringxDef(widgetType: IWidgetType) {
    let dxProps: any = [];
    let dxBlockConfig: any = {};
    let dxInitData: any = {};
    dxInitData.props = {};
    const props = widgetType.props;
    props.unshift({
        key: '__name',
        label: '名称',
        valueType: 'string',
        defaultValue: widgetType.name
    })
    for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        if (prop.valueType === "string") {
            dxProps.push(createPannelOptions<InputMap, 'input'>('input', {
                receive: prop.key,
                label: prop.label,
            }))
            dxInitData.props[prop.key] = prop.defaultValue
        }else if(prop.valueType==='number'){
            dxProps.push(createPannelOptions<NumberInputMap, 'numberInput'>('numberInput', {
                receive: prop.key,
                label: prop.label,
            }))
            dxInitData.props[prop.key] = prop.defaultValue
        }
    }
    dxInitData['width'] = widgetType?.advanced?.defaultWidth;
    dxInitData['height'] = widgetType?.advanced?.defaultWidth;
    dxInitData.canDrag = !widgetType?.advanced?.noDrag;
    dxInitData.position = widgetType.advanced.noBroder ? 'static' : null;
    dxBlockConfig = {
        props: dxProps,
    }
    return [dxBlockConfig, dxInitData];
}

export default getDooringxDef;