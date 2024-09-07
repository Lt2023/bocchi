// import {PlayCircleOutlined} from '@ant-design/icons';
import * as propsFormComponents from './porpsFormComponents';
import {InitConfig} from "dooringx-lib";

export const dooringxDefaultConfig: Partial<InitConfig> = {
    leftAllRegistMap: [],
    leftRenderListCategory: [
        {
            type: 'builtin',
            displayName: '内置组件',
            icon: undefined
        },
    ],
    initComponentCache: {},
    rightRenderListCategory: [
        {
            type: 'props',
            icon: '属性',
        },
    ],
    initFunctionMap: {},
    initCommandModule: [],
    initFormComponents: {
        input: propsFormComponents.input,
        numberInput:propsFormComponents.numberInput
    },
};