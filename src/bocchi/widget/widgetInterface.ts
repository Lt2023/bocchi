export interface IWidgetType {
    // 控件作者
    author: string;
    // 控件主题色，用于toolbox
    color: string;
    // 控件图标，url类型，可以是base64的，大小最好60*60以上，为正方形
    icon: string;
    // 控件显示给用户的名称
    name: string;
    // 控件类型，用于识别控件的内部名称，必须以"WIDGET_" 开头（内置为"BUILTIN_WIDGET"，会影响判断！），由大写和下划线组成
    type: string;
    //
    emit: IWidgetEmit[];
    // 控件参数，会生成在dxFlyout中，并默认生成getter、setter积木
    props: IWidgetProp[];
    // 控件方法
    methods: IWidgetMethod[];
    // 控件高级设置
    advanced: IWidgetAdvanced;
    category?: string;
    // 控件是不是不可见控件
    /*
    * 其实就是语法糖
    * 将设置如下
        widgetType.advanced.staticWidgetName = 'true';
        widgetType.advanced.noResize = true;
        widgetType.advanced.noDrag = true;
        widgetType.advanced.defaultHeight = 0;
        widgetType.advanced.defaultWidth = 0;
        widgetType.advanced.noBroder = true;
    * */
    invisible?: boolean;

}

export interface IWidgetMethod {
    // 将会执行widget实例中与key同名的函数
    key: string,
    // 显示名称
    label: string,
    // 返回类型 code 就是普通的类型 没有的默认 code
    valueType?: 'string' | 'code' | 'number',
    // 参数列表
    params: IWidgetMethodParam[];
    // 不显示控件选择
    noWidgetNameSelect?: boolean
    // 是否可以连接前一个段 true 不可以
    noPs?: boolean,
    // 是否可以连接后一个段 true 不可以
    noNs?: boolean,
    // 颜色，默认#ffbb55
    color?: string,
    // 调用。。。 字符串替换
    tipBefore?: string
    // 。。。执行 字符串替换
    tipAfter?: string
}

export interface IWidgetMethodParam {
    key: string,
    label: string,
    // code 类型就是加载一个段
    valueType: 'string' | 'code' | 'number',
    // 键：名称
    dropdown?: [string, string | number][]
    // code 的label要不要换行 默认换行
    codeNotBreakLine?: boolean
    // code 无效
    defaultValue?: string | number
    // 仅 code 有效 TODO
    codeParams?: IWidgetMethodParamCodeParam[],
}

export interface IWidgetMethodParamCodeParam {
    key: string,
    label: string,
    valueType: 'string' | 'number',
}

export interface IWidgetEmit {
    key: string,
    label: string,
    params: IWidgetEmitParam[];
}

export interface IWidgetEmitParam {
    key: string,
    label: string,
    valueType: 'string' | 'number',
}

export interface IWidgetProp {
    key: string,
    label: string,
    valueType: 'string' | 'number',
    defaultValue: string | number,
    // 不生成Block
    noBlock?: boolean;
}

export interface IWidgetAdvanced {
    defaultWidth?: number,
    defaultHeight?: number,
    staticWidget?: boolean,
    noResize?: boolean;
    noDrag?: boolean;
    noBroder?: boolean;
    // 是否不显示 dx的flyout 注意：这将无法在编辑器设置属性！
    noDxFlyout?:boolean;
}

export interface IWidgetArgs {
    id: string,
}
