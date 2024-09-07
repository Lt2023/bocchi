import {IWidgetMethod, IWidgetType} from "./widgetInterface.ts";

export function preprocessProps(widgetType: IWidgetType): IWidgetMethod[] {
    let propMethodGetter: IWidgetMethod[] = [];
    let propMethodSetter: IWidgetMethod[] = [];
    widgetType.props.map((prop) => {
        if(prop.noBlock)return;
        propMethodGetter.push({
            key: `PROP_GETTER_${prop.key}`,
            label: `${prop.label} 的值`,
            valueType: prop.valueType,
            params: [],
            color: '#e76cea',
            tipBefore: '获取',
            tipAfter: ' ',
        })
        propMethodSetter.push({
            key: `PROP_SETTER_${prop.key}`,
            label: `${prop.label} 的值`,
            valueType: 'code',
            params: [
                {
                    key: "value",
                    label: "",
                    valueType: prop.valueType,
                    defaultValue: prop.defaultValue
                }
            ],
            color: '#e76cea',
            tipBefore: '设置',
            tipAfter: ' ',
        })
    })
    return [...propMethodSetter, ...propMethodGetter];
}

export function preprocessEmits(widgetType: IWidgetType): IWidgetMethod[] {
    let emitMethods: IWidgetMethod[] = [];
    widgetType.emit.map((emit) => {
        emitMethods.push({
            key: `EMIT_${emit.key}`,
            label: `${emit.label} 时`,
            valueType: 'code',
            params: [
                {
                    key: "func",
                    label: "",
                    valueType: "code",
                    codeParams: emit.params
                }
            ],
            color: '#608fee',
            noPs: true,
            noNs: true,
            tipBefore: '当',
            tipAfter: ' ',
        })
    })
    return emitMethods;
}

export function preprocessPropsFn(widgetType: IWidgetType) {
    let propMethodFn: Record<string, (...arg: any[]) => any> = {};
    widgetType.props.map((prop) => {
        if(prop.noBlock)return;
        propMethodFn[`PROP_GETTER_${prop.key}`] = function () {
            return this.props[prop.key as keyof typeof this.props];
        }
        propMethodFn[`PROP_SETTER_${prop.key}`] = function (value) {
            this.__setProp(prop.key, value);
            this.__onPlayerFreshWidgetsProp(prop.key, value);
        }
    })
    return propMethodFn;
}

export function preprocessEmitsFn(widgetType: IWidgetType){
    let emitMethodFn: Record<string, (...arg: any[]) => any> = {};
    widgetType.emit.map((emit) => {
        emitMethodFn[`EMIT_${emit.key}`] = function (func: (...arg: any[]) => void) {
            if (!this.__emits[emit.key as keyof typeof this.__emits]) {
                (this.__emits[emit.key as keyof typeof this.__emits] as ((...arg: any[]) => void)[]) = [];
            }
            (this.__emits[emit.key as keyof typeof this.__emits] as ((...arg: any[]) => void)[]).push(
                (...arg) => {
                    func.apply(this, arg);
                }
            )
        }
    })
    return emitMethodFn;
}