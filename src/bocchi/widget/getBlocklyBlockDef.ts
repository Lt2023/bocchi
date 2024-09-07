import {IWidgetMethod, IWidgetMethodParam, IWidgetType} from "./widgetInterface.ts";
import {getMethodBlockType} from "./utils.ts";
import Blockly from "blockly";
import * as CryptoJS from 'crypto-js'

function getBlocklyBlockDef(type: IWidgetType): any[] {
    let blocks: any[] = [];
    let generators: any[] = [];
    type.methods.map((method) => {
        const [block, generator] = getMethodBlockDef(method, type);
        blocks.push(block);
        generators.push(generator);
        const [cpBlock, cpGenerator] = getMethodCodeParamBlocksDef(method, type);
        blocks.push(...cpBlock);
        generators.push(...cpGenerator);
    })
    return [blocks, generators];
}

function getMethodCodeParamBlocksDef(widgetMethod: IWidgetMethod, widgetType: IWidgetType) {
    let blocks: any[] = [];
    let generators: any[] = [];
    widgetMethod.params.map((param) => {
        param.codeParams?.map((cp) => {
            blocks.push({
                "type": `CODE_PARAM_BLOCK_${widgetType.type}_${widgetMethod.key}_${param.key}_${cp.key}`,
                "message0": `${cp.label}`,
                "output": [cp.valueType.charAt(0).toUpperCase()
                + cp.valueType.slice(1), `CODE_PARAM_${widgetType.type}_${widgetMethod.key}_${param.key}_${cp.key}`],
                "colour": '#3ca9ff',
                "tooltip": "",
                "helpUrl": "",
                'extensions': []
            })
            generators.push({
                type: `CODE_PARAM_BLOCK_${widgetType.type}_${widgetMethod.key}_${param.key}_${cp.key}`,
                fn: function (block: any, generator: any) {
                    let code = cp.key;
                    if (this.data._param_id) {
                        code += CryptoJS.SHA256(this.data._param_id);
                    }
                    return [code, 0];
                }
            })
        })
    })
    return [blocks, generators]
}

function getMethodMessage(widgetMethod: IWidgetMethod) {
    // %1 是为了留给名称插槽
    let message = ``;
    if (!widgetMethod.noWidgetNameSelect)
        message = `${widgetMethod.tipBefore || '调用'} %1 ${widgetMethod.tipAfter || '执行'} ${widgetMethod.label}`;
    else message = `%1 ${widgetMethod.label}`;
    // message %x 的count
    let cnt = 2;
    widgetMethod.params.map((param) => {
        // 一些特判断
        if (param.valueType === 'code') {
            if (param.codeParams) {
                param.codeParams.map((codeParam) => {
                    message = message.concat(` %${cnt++}`);
                })
            }
            message = message.concat(` ${param.label} %${cnt.toString()}`);
            cnt++;
            // code 需要特判是否换行
            if (!param.codeNotBreakLine) {
                message = message.concat(` %${cnt.toString()}`);
                cnt++;
            }
        } else {
            // message0 需要一点点生成
            message = message.concat(` ${param.label} %${cnt.toString()}`);
            cnt++;
        }
    })
    return message;
}

function getMethodParamDef(widgetMethodParam: IWidgetMethodParam, widgetMethod: IWidgetMethod, widgetType: IWidgetType) {
    let args: any = [];
    switch (widgetMethodParam.valueType) {
        case "code": {
            if (widgetMethodParam.codeParams) {
                widgetMethodParam.codeParams.map((codeParam) => {
                    args.push({
                        "type": "input_value",
                        "name": `CODE_PARAM_${widgetMethodParam.key}_${codeParam.key}`,
                        "check": `CODE_PARAM_${widgetType.type}_${widgetMethod.key}_${widgetMethodParam.key}_${codeParam.key}`
                    });
                })
            }
            if (!widgetMethodParam.codeNotBreakLine) {
                args.push({
                    "type": "input_dummy"
                });
            }
            args.push({
                "type": "input_statement",
                "name": widgetMethodParam.key
            });
            break;
        }

        case "string": {
            if (widgetMethodParam.dropdown) {
                args.push({
                    "type": "field_dropdown",
                    "name": widgetMethodParam.key,
                    "options": widgetMethodParam.dropdown
                },)
            } else {
                args.push({
                    "type": "input_value",
                    "name": widgetMethodParam.key,
                    "check": "String"
                })
            }
            break;
        }
        case "number": {
            if (widgetMethodParam.dropdown) {
                args.push({
                    "type": "field_dropdown",
                    "name": widgetMethodParam.key,
                    "options": widgetMethodParam.dropdown
                },)
            } else {
                args.push({
                    "type": "input_value",
                    "name": widgetMethodParam.key,
                    "check": "Number"
                })
            }
            break;
        }
    }
    return args;
}

function getMethodGenerator(widgetMethod: IWidgetMethod, widgetType: IWidgetType) {
    return function (block: any, generator: any) {
        let props: string = '{';
        widgetMethod.params.map((param) => {
            if (param.valueType === "code") {
                // @ts-ignore
                props += `${param.key}:async (${param.codeParams?.map(i => i.key + CryptoJS.SHA256(this.id)).join(',')})=>{${generator.statementToCode(block, param.key)}},`;
            } else if (param.dropdown) {
                props += `${param.key}:'${block.getFieldValue(param.key)}',`;
            } else {
                // 99: Blockly.JavaScript.ORDER_NONE = 99;            // (...)
                props += `${param.key}:${generator.valueToCode(block, param.key, 99)},`
            }
        })
        if (!widgetMethod.noWidgetNameSelect) {
            props += `WIDGET_ID:'${block.getFieldValue('WIDGET_ID')}',`
        } else {
            props += `WIDGET_ID:'${widgetType.type}',`
            props += `NONAME:true,`
        }
        props += `METHOD:'${widgetMethod.key}',`
        props += `}`
        if (widgetMethod.valueType && widgetMethod.valueType !== 'code') {
            return [`await exec(${props})`, 99];
        }
        if (widgetMethod.key.startsWith('EMIT_')) {
            return `exec(${props});`;
        }
        return `exec(${props});`;
    };
}

function getMethodBlockDef(widgetMethod: IWidgetMethod, widgetType: IWidgetType) {
    // 定义模板
    let block: any = {
        "type": getMethodBlockType(widgetType, widgetMethod),
        "message0": getMethodMessage(widgetMethod),
        "args0": [],
        "colour": widgetMethod.color || '#ffbb55',
        "tooltip": "",
        "helpUrl": "",
        "inputsInline": true,
        "extensions": []
    };

    // widget 动态名称管理插件
    if (!widgetMethod.noWidgetNameSelect)
        block["extensions"].push(`dynamic_dropdown_widgetID_${widgetType.type}_extension`);
    block.args0.push(
        {
            "type": "input_dummy",
            "name": "WIDGET_ID_dummy"
        }
    )
    if (!widgetMethod.noPs)
        block["previousStatement"] = null;
    if (!widgetMethod.noNs)
        block["nextStatement"] = null;
    if (widgetMethod.valueType && widgetMethod.valueType !== 'code') {
        block["previousStatement"] = undefined;
        block["nextStatement"] = undefined;
        switch (widgetMethod.valueType) {
            case 'string': {
                block['output'] = 'String'
                break;
            }
            case "number": {
                block['output'] = 'Number'
                break;
            }
        }
    }
    widgetMethod.params.map((param) => {
        block.args0.push(...getMethodParamDef(param, widgetMethod, widgetType));
    })
    return [block, {
        type: getMethodBlockType(widgetType, widgetMethod),
        fn: getMethodGenerator(widgetMethod, widgetType)
    }];
}


export {getBlocklyBlockDef};