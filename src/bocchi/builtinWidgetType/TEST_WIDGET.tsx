import Widget from "../widget/widget.tsx";
import {IWidgetType} from "../widget/widgetInterface.ts";


class TEST_WIDGET extends Widget {
    widgetType(): IWidgetType {
        let widgetType = super.widgetType();
        widgetType.type = 'TEST_WIDGET';
        widgetType.name = '测试控件';
        widgetType.methods.push({
            key: 'TESTBLOCK_no_param',
            label: '测试块_no_param',
            params: []
        });
        widgetType.methods.push({
            key: 'TESTBLOCK_param_2',
            label: '测试块_param_2',
            params: [
                {
                    key: 'p1',
                    label: 'p1',
                    valueType: 'string',
                    defaultValue: 'p1v',
                },
                {
                    key: 'p2',
                    label: 'p2',
                    valueType: 'string',
                    defaultValue: 'p2v',
                }
            ]
        });
        widgetType.methods.push({
            key: 'TESTBLOCK_param_code',
            label: '测试块_param_code',
            params: [
                {
                    key: 'p1',
                    label: 'p1',
                    valueType: 'string',
                    defaultValue: 'p1v',
                },
                {
                    key: 'p2',
                    label: 'p2',
                    valueType: 'string',
                    defaultValue: 'p2v',
                },
                {
                    key: 'pcode',
                    label: 'pcode',
                    valueType: 'code',
                }
            ]
        });
        widgetType.methods.push({
            key: 'TESTBLOCK_code_param',
            label: '测试块_code_param',
            params: [
                {
                    key: 'pcode',
                    label: 'pcode',
                    valueType: 'code',
                    codeParams: [
                        {
                            key: "p1",
                            label: "p1",
                            valueType: "string"
                        }
                    ]
                }
            ]
        });
        widgetType.methods.push({
            key: 'TESTBLOCK_param_dropdown',
            label: '测试块_param_dropdown',
            params: [
                {
                    key: 'd',
                    label: 'd',
                    valueType: 'string',
                    defaultValue: 'p1v',
                    dropdown: [
                        ['显示名称', 'value']
                    ]
                }
            ]
        });
        widgetType.methods.push({
            key: 'TESTBLOCK_string_output',
            label: '测试块_string_output',
            params: [
                {
                    key: 'd',
                    label: 'd',
                    valueType: 'string',
                    defaultValue: 'p1v',
                }
            ],
            valueType: "string",
            noWidgetNameSelect: true
        });
        widgetType.methods.push({
            key: 'TESTBLOCK_number_and_output',
            label: '测试块_number_and_output',
            params: [
                {
                    key: 'd',
                    label: 'd',
                    valueType: 'number',
                    defaultValue: 111,
                }
            ],
            valueType: "number",
            noWidgetNameSelect: true
        });
        widgetType.props.push({
            key: 'TESTPROP_STRING',
            label: '测试属性_string',
            valueType: 'string',
            defaultValue: 'ssss'
        })
        widgetType.props.push({
            key: 'TESTPROP_NUMBER',
            label: '测试属性_number',
            valueType: 'number',
            defaultValue: 114514
        })
        widgetType.emit.push({
            key: "TESTEMIT_pamar",
            label: "测试事件_参数",
            params: [
                {
                    key:'p1',
                    label:'pp1',
                    valueType:'string'
                }
            ]

        })
        return widgetType;
    }
}

export default TEST_WIDGET;