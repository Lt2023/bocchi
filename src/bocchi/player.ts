import {ComponentItemFactory, deepCopy, UserConfig} from "dooringx-lib";
import Widget from "./widget/widget.tsx";
import {dooringxDefaultConfig} from "./dooringxDefaultConfig.tsx";
import {IBewc, IExecProp} from "./bewcType.ts";
import {logger} from "./logger.ts";
import React from "react";
// @ts-ignore
import * as Babel from '@babel/standalone'
import BUILTIN_WIDGETS from "./builtinWidgetType";
import * as Antd from 'antd'


export class Player {
    public dxConfig: UserConfig;
    public playerCode: string;
    public widgetTypes: Record<string, typeof Widget>;
    public widgets: Record<string, Widget>;
    public inited: boolean

    constructor() {
        this.dxConfig = new UserConfig(dooringxDefaultConfig);
        this.playerCode = ""
        this.widgetTypes = {};
        this.widgets = {};
        this.inited = false;
    }

    runBewc(bewcData: IBewc) {
        this.inited = true;
        this.importBuiltinWidgets();
        for (let scriptId in bewcData.scriptCodes) {
            logger.info('load', 'script', scriptId);
            this.importWidgetFromCode(bewcData.scriptCodes[scriptId]);
        }
        // 先加载组件们
        bewcData.widgetList.map((widgetId) => {
            let widgetType = widgetId.split('-')[0];
            this.widgets[widgetId] = new this.widgetTypes[widgetType]({id: widgetId});
        })
        this.dxConfig.getStore().setData(bewcData.dxStore);
        this.dxConfig.store.forceUpdate();
        this.playerCode = bewcData.blockCode;
        let blockCodeFn = new Function('exec', this.playerCode);
        blockCodeFn.call(null, async (props: IExecProp) => {
            return this.widgetExec(props);
        });
        // 运行组建的 onPlayerReady
        bewcData.widgetList.map(async (widgetId) => {
            await this.widgets[widgetId].__onPlayerReady();
        })
    }

    importBuiltinWidgets() {
        //导入内置控件
        BUILTIN_WIDGETS.map((widget) => {
            this.importWidget(widget);
        })
    }

    importWidgetFromCode(code: string) {
        let widgetFn = new Function('BocchiWidget', 'logger', "React", 'Antd',
            `
                let bocchi={};
                bocchi.exportWidgets = [];
                bocchi.scriptID="noid";
                `
            + Babel.transform(code, {presets: ["env", "react"]}).code +
            `
                ;return bocchi;
                `
        );
        let widgets: any = widgetFn.call(null, Widget, logger, React, Antd);
        if (widgets["scriptID"] === 'noid') {
            logger.error('Widget', 'importWidget', '自定义脚本未设置 scriptID！');
            return;
        }

        for (let i = 0; i < widgets['exportWidgets'].length; i++) {
            this.importWidget(widgets['exportWidgets'][i]);
        }
    }

    importWidget(widget: typeof Widget) {
        const widgetType = widget.prototype.widgetType();
        let regMapType = 'builtin';
        if (widgetType.advanced?.staticWidget) {
            regMapType = 'hidden';
        }
        logger.group('Widget', 'importWidget', widgetType.type, widgetType.name);
        logger.info('Widget', 'widgetType', widgetType);

        // 添加控件会丢失store信息 但是player没有必要存储
        this.dxConfig.addCoRegistMap({
            type: regMapType,
            component: widgetType.type,
            img: 'icon',
            imgCustom: React.createElement("img", {src: widgetType.icon, style: {width: '60px', height: '60px'}}),
            displayName: widgetType.name,
        });
        // 初始化dx控件
        const [widgetProps, widgetInitData] = widget.prototype._getDooringxDef();
        logger.info('Widget', 'dxDef', widgetProps, widgetInitData);
        this.widgetTypes[widgetType.type] = widget;
        // 是否可以resize的处理
        let resize = true;
        if (widgetType.advanced?.noResize) {
            resize = false;
        }
        const comp = new ComponentItemFactory(
            widgetType.type,
            widgetType.name,
            widgetProps,
            widgetInitData,
            (data, context, store, config) => {
                return this.widgets[data.id]._render(data, context, store, config);
            },
            resize
        );
        this.dxConfig.registComponent(comp);
        // 静态控件此处添加实体
        // 静态控件常常都是不可见的。我们在左上角创建一个block
        if (widgetType.advanced?.staticWidget) {
            // 静态控件，仅添加在工具箱添加一个控件，不可继续添加
            let block = {
                id: comp.name,
                name: comp.name,
                left: 0,
                top: 0,
                zIndex: comp.initData.zIndex || 0,
                props: comp.initData.props || {},
                resize: comp.initData.resize || comp.resize,
                focus: comp.initData.focus ?? true,
                position: comp.initData.position || 'absolute',
                display: comp.initData.display || 'block',
                width: comp.initData.width,
                height: comp.initData.height,
                syncList: comp.initData.syncList || [],
                canDrag: comp.initData.canDrag ?? true,
                canSee: comp.initData.canSee ?? true,
                eventMap: comp.initData.eventMap || {},
                functionList: comp.initData.functionList || [],
                animate: comp.initData.animate || [],
                fixed: comp.initData.fixed || false,
                rotate: comp.initData.rotate || {
                    value: 0,
                    canRotate: true,
                },
            }
        }
        logger.groupEnd('', '');
    }

    async widgetExec(props: IExecProp): Promise<any> {
        logger.group('widgetExec', 'exec', props.WIDGET_ID, props.METHOD);
        logger.info('widgetExec', 'props', props);
        if (this.widgets[props.WIDGET_ID]) {
            let dxBlock = this.dxConfig.getStore().getData().block.find(e => e.id === props.WIDGET_ID);
            if (!dxBlock) {
                logger.error('widgetExec', 'NoDxBlock', props);
                return;
            }
            this.widgets[props.WIDGET_ID].__setProp = (propName, value) => {
                logger.primary('widgetExec', '__setProp', propName, value);
                let data = this.dxConfig.getStore().getData();
                data.block.map((block) => {
                    if (block.id === props.WIDGET_ID) {
                        block.props[propName] = value;
                    }
                })
                this.dxConfig.getStore().setData(deepCopy(data));
            }
            this.widgets[props.WIDGET_ID].__config = this.dxConfig;
            let returnValue = await this.widgets[props.WIDGET_ID]._callMethod(props, dxBlock);
            logger.primary('widgetExec', 'ReturnValue', returnValue);
            logger.groupEnd('', '');
            return returnValue;
        } else {
            logger.error('widgetExec', 'NoWidget', props);
        }
        logger.groupEnd('', '');
        return undefined;
    }
}