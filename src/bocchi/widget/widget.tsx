import bqIcon from '../../assets/bocchi_logo.jpg'
import {deepCopy, UserConfig} from "dooringx-lib";
import Store from "dooringx-lib/dist/core/store";
import {IBlockType} from "dooringx-lib/dist/core/store/storetype";
import getDooringxDef from "./getDooringxDef.ts";
import getBlocklyFlyoutDef from "./getBlocklyFlyoutDef.ts";
import {IWidgetArgs, IWidgetType} from "./widgetInterface.ts";
import {getBlocklyBlockDef} from "./getBlocklyBlockDef.ts";
import {preprocessEmits, preprocessEmitsFn, preprocessProps, preprocessPropsFn} from "./preprocess.ts";
import {IExecProp} from "../bewcType.ts";
import {logger} from "../logger.ts";

class Widget {
    public id: string;
    public props: Record<string, any>;
    public __data: IBlockType | undefined;
    public __context: any | undefined;
    public __store: Store | undefined;
    public __config: UserConfig | undefined;
    public __setProp: (propName: string, value: any) => void;
    public __emits: Record<string, ((...arg: any[]) => void)[]>

    constructor(widgetArgs: IWidgetArgs) {
        this.id = widgetArgs.id;
        this.props = {};
        this.__emits = {};
        this.__setProp = (propName, value) => {
            if(!this.__config){
                logger.error('Widget', 'setPropNoConfig', propName, value);
                return;
            }
            const cloneData = deepCopy(this.__config.store.getData());
            const newBlock = cloneData.block.map((v: IBlockType) => {
                if (v.id === this.id) {
                    v.props[propName] = value;
                }
                return v;
            });
            this.__config.store.setData({...cloneData, block: [...newBlock]});
        };
    }

    widgetType(): IWidgetType {
        return {
            author: 'BQE',
            color: '#722ED1',
            icon: bqIcon,
            name: '未命名控件',
            type: 'WIDGET_UNNAME',
            props: [],
            methods: [],
            emit: [],
            advanced: {
                defaultWidth: 200,
            }
        }
    }

    async __onPlayerReady() {
    }

    __onEditorFreshWidgetsProps(props: Record<string, any>) {

    }

    __onPlayerFreshWidgetsProp(key: string, value: any) {

    }

    _getBlocklyBlockDef() {
        return getBlocklyBlockDef(this._preprocessed_widgetType());
    }

    _getBlocklyFlyoutDef(key: string) {
        return getBlocklyFlyoutDef(this._preprocessed_widgetType(), key);
    }

    _getDooringxDef() {
        return getDooringxDef(this._preprocessed_widgetType());
    }

    _parseProps(data: IBlockType) {
        this.props = data.props;
    }

    _render(data: IBlockType, context: any, store: Store, config: UserConfig) {
        logger.primary('Widget', '_render', data.id);
        // 解析参数
        this.__data = data;
        this.__context = context;
        this.__store = store;
        this.__config = config;
        this._parseProps(data);
        return this.render();
    }

    // 预处理widget的一些特性
    _preprocessed_widgetType() {
        let widgetType = this.widgetType();
        if (widgetType.invisible) {
            widgetType.advanced.staticWidget = true;
            widgetType.advanced.noResize = true;
            widgetType.advanced.noDrag = true;
            widgetType.advanced.defaultHeight = 0;
            widgetType.advanced.defaultWidth = 0;
            widgetType.advanced.noBroder = true;
        }
        widgetType.methods.unshift(...preprocessProps(widgetType));
        widgetType.methods.unshift(...preprocessEmits(widgetType));
        let preprocessPropsFns = preprocessPropsFn(widgetType);
        for (let key in preprocessPropsFns) {
            // @ts-ignore
            this[key as keyof typeof this] = preprocessPropsFns[key];
        }
        let preprocessEmitsFns = preprocessEmitsFn(widgetType);
        for (let key in preprocessEmitsFns) {
            // @ts-ignore
            this[key as keyof typeof this] = preprocessEmitsFns[key];
        }
        return widgetType;
    }

    async _callMethod(props: IExecProp, dxProps: IBlockType): Promise<any> {
        this._parseProps(dxProps);
        let methodType = this._preprocessed_widgetType().methods.find((e) => e.key === props.METHOD);
        let methodFn = this[props.METHOD as keyof typeof this];
        if (!methodType) {
            logger.error('Widget', 'NoMethod', props);
            return;
        }
        let arrayArg: any[] = [];
        methodType.params.map((param) => {
            arrayArg.push(props[param.key]);
        })
        if (typeof methodFn === 'function') {
            let returnValue = await methodFn.apply(this, arrayArg);
            logger.primary('Widget', 'MethodReturnValue', returnValue);
            return returnValue;
        } else {
            logger.error('Widget', 'NoMethodFn', props);
        }
        return undefined;
    }

    async emit(emitKey: string, ...arg: any[]) {
        logger.info('Widget', 'Emit', emitKey, this.__emits);
        if (this.__emits[emitKey]) {
            this.__emits[emitKey].map(async (fn) => {
                await fn.apply(this, arg);
            })
        }
    }

    render() {
        return <span>No Render! (WidgetID:{this.id},props:{JSON.stringify(this.props)})</span>;
    }

}

export default Widget;