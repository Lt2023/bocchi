import {logger} from "./logger.ts";
import React, {useState} from "react";
import {
    BocchiDefaultHeaderFnProps,
    BocchiDefaultHeaderStateProps,
    IHeaderFnProps,
    IHeaderStateProps
} from "./header/header.ts";
import {SubMenuType} from "antd/es/menu/hooks/useItems";
import Blockly, {Block, WorkspaceSvg} from 'blockly'
import * as locale from 'blockly/msg/zh-hans';
import {ComponentItemFactory, createUid, deepCopy, UserConfig} from "dooringx-lib";
import {dooringxDefaultConfig} from "./dooringxDefaultConfig.tsx";
import Widget from "./widget/widget.tsx";
import {javascriptGenerator} from 'blockly/javascript';
// @ts-ignore
import * as Babel from '@babel/standalone'
import BUILTIN_WIDGETS from "./builtinWidgetType";
import {regDxContextMenu, regToolboxItemContextMenuEditor} from "./contextMenu.tsx";
import {downloadText, loadText} from "./utils.ts";
import {compress} from "lz-string";
import Store from "dooringx-lib/dist/core/store";
import {IStoreData} from "dooringx-lib/dist/core/store/storetype";
import {block} from "blockly/core/tooltip";
import {IBewc} from "./bewcType.ts";
import * as Antd from 'antd'
import workspace from "../components/Workspace.tsx";
import {blocklyHooks} from "./blockly/blocklyHooks.ts";
import {bocchiTheme} from './blockly/theme.ts'
import {message} from "antd";

export interface IEditorState {
    dooringxMode: 'edit' | 'preview',
    toolbox: IToolboxState;
    flyoutMode: 'dx' | 'blockly' | 'none'
}

export interface IToolboxItemState {
    key: string,
    color: string,
    name: string,
    icon: string
}

export interface IToolboxCategoryState {
    label: string;
    key: string;
    items: IToolboxItemState[];
}

export interface IToolboxState {
    nowFocus: string;
    items: IToolboxCategoryState[];
}

export interface IWorkData {
    scriptCodes: Record<string, string>,
    dxStore: IStoreData,
    blocks: any,
    widgetList: string[];
    workName: string;
}

class Editor {
    public state: IEditorState;
    public stateFreshCallback: (_state: IEditorState) => void;
    public headerFn: IHeaderFnProps;
    public workspace: WorkspaceSvg | undefined;
    public dxConfig: UserConfig;
    public headerState: IHeaderStateProps;
    public widgetTypes: Record<string, typeof Widget>;
    public widgets: Record<string, Widget>;
    public widgetCount: number;
    public scriptCodes: Record<string, string>;
    public messageApi: (type: string, msg: any) => void;

    constructor() {
//初始化 state 状态区域

        this.state = <IEditorState>{};
        this.stateFreshCallback = (_state) => {
        };
        this.headerState = BocchiDefaultHeaderStateProps;
        this.state.dooringxMode = 'edit';
        this.headerFn = BocchiDefaultHeaderFnProps;
        this.headerState.menuItems?.filter(v => {
                if (v?.key === 'file') {
                    (v as SubMenuType).children.push({
                        key: 'import_widget',
                        label: '导入组件',
                    })
                }
            }
        )
        this.widgets = {};
        this.headerFn.menuFn = (key) => this.menuFnHandler(key);
        this.headerFn.runFn = () => {
            if (this.state.dooringxMode === 'edit') {
                this.state.dooringxMode = 'preview'
            } else {
                this.state.dooringxMode = 'edit';
            }
            this.freshState();
        }
        this.headerFn.saveFn = () => {
            downloadText(`${this.headerState.workName}.bew`, (JSON.stringify(this.saveWorkToJson())));
        }
        this.headerFn.workNameChangeFn = (name: string) => {
            this.headerState.workName = name;
        }
        this.state.toolbox = <IToolboxState>{};
        this.state.toolbox.nowFocus = 'screen';
        this.state.toolbox.items = [];
        this.state.flyoutMode = 'none';
        // dx 配置
        this.dxConfig = new UserConfig(dooringxDefaultConfig);
        this.dxConfig.i18n = false;
        this.dxConfig.containerOverFlow = false;
        this.dxConfig.ticker = false;
        this.regContextMenu();
        this.widgetTypes = {};
        this.scriptCodes = {};
        this.newToolboxCategory('feature', '功能');
        this.newToolboxCategory('ui', '界面');
        this.widgetCount = 0;
        this.dxConfig.getStore().subscribe(() => {
            // 处理新增的块
            const blocks = this.dxConfig.getStore().getData().block;
            if (
                blocks.length > this.widgetCount
            ) {
                const newBlock = blocks[blocks.length - 1];

                if (this.widgetTypes[newBlock.id.split('-')[0]]) {
                    this.widgets[newBlock.id] = new this.widgetTypes[newBlock.id.split('-')[0]]({id: newBlock.id});
                    if (newBlock.name !== newBlock.id) newBlock.props.__name = this.widgets[newBlock.id]._preprocessed_widgetType().name + String(Math.ceil(Math.random() * 100));
                    this.widgets[newBlock.id].__config = this.dxConfig;
                }
                this.newToolboxItem(this.widgets[newBlock.id]._preprocessed_widgetType().category || 'ui', {
                    key: newBlock.id,
                    name: this.widgets[newBlock.id].props.__name,
                    icon: this.widgets[newBlock.id]._preprocessed_widgetType().icon,
                    color: this.widgets[newBlock.id]._preprocessed_widgetType().color
                })

                //END
                const data = deepCopy(this.dxConfig.getStore().getData());
                data.block.pop();
                if (newBlock) data.block.push(newBlock);
                this.widgetCount = data.block.length;
                this.dxConfig.getStore().setData(data);
            }

            // 处理被聚焦的块

            let focus = 'BUILTIN_SCREEN';
            for (let i = 0; i < blocks.length; i++) {
                if (blocks[i].focus) {
                    focus = blocks[i].id;
                    break;
                }
            }
            if (focus === 'BUILTIN_SCREEN') {
                for (let i = 0; i < blocks.length; i++) {
                    if (blocks[i].id === 'BUILTIN_SCREEN') {
                        blocks[i].focus = true;
                        break;
                    }
                }
            }
            if (this.state.toolbox.nowFocus !== focus) {
                this.state.toolbox.nowFocus = focus;
                // 如果是blockly的flyout，刷新
                if (this.state.flyoutMode === 'blockly') {
                    this.workspace?.getToolbox()?.getFlyout()?.hide();
                    const flyout = this.getBlocklyFlyoutDef(focus);
                    logger.info('Focus', 'FlushBlocklyFlyout', flyout);
                    this.workspace?.getToolbox()?.getFlyout()?.show(flyout);
                    // hide的hook 会修改flyoutMode！！！这句不能删
                    this.state.flyoutMode = 'blockly';
                }
            }

            // 阻止右击菜单
            document.oncontextmenu = function () {
                return false;
            }
            this.freshToolboxName();
            this.freshBlockName();
            this.freshWidgetsProps();
            this.freshState();
        });
        this.importBuiltinWidgets();
        blocklyHooks();
        bocchiTheme();
        this.messageApi = (type: string, msg) => {
        };
    }

    menuFnHandler(key: string) {
        if (key === 'import_widget') {
            // const TESTWidgetString = `
            // class MyWidget extends BocchiWidget{
            //     constructor(arg) {
            //         super(arg);
            //         logger.info('WWWWW','WWWWWWWWW',this);
            //     }
            //     render(){
            //         return <span>nice!{this.id}</span>;
            //     }
            // }
            // bocchi.exportWidgets=[MyWidget];
            // `
            loadText('.jsx', (text) => {
                this.importWidgetFromCode(text);
            });
        } else if (key === 'save') {
            downloadText(`${this.headerState.workName}.bew`, (JSON.stringify(this.saveWorkToJson())));
        } else if (key === 'open') {
            loadText('.bew', (data) => {
                if (data)
                    this.loadWorkFromJson(JSON.parse(data));
            })
        }
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
        this.scriptCodes[widgets["scriptID"]] = code;

        for (let i = 0; i < widgets['exportWidgets'].length; i++) {
            this.importWidget(widgets['exportWidgets'][i]);
        }
    }

    importWidget(widget: typeof Widget) {
        const widgetType = widget.prototype._preprocessed_widgetType();
        let regMapType = 'builtin';
        if (widgetType.advanced?.staticWidget) {
            // 静态控件，仅添加在工具箱添加一个控件，不可继续添加
            // 设置一个不存在的type，以隐藏
            regMapType = 'hidden';
        }
        logger.group('Widget', 'importWidget', widgetType.type, widgetType.name);
        logger.info('Widget', 'widgetType', widgetType);

        // 添加控件会丢失store信息
        const storeBackup = deepCopy(this.dxConfig.store.getData());
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
            storeBackup.block.push(block);
        }
        this.dxConfig.store.setData(deepCopy(storeBackup));


        // 添加blockly内容
        let [blocklyJsonDef, blocklyFnMap] = widget.prototype._getBlocklyBlockDef();
        logger.info('Widget', 'blocklyDef', blocklyJsonDef, blocklyFnMap);
        blocklyJsonDef.map((jsonBlock: any) => {
            Blockly.Blocks[jsonBlock.type] = {
                init: function () {
                    this.jsonInit(jsonBlock);
                },
                onchange: function (e: any) {
                    if (
                        this.type.startsWith('CODE_PARAM_BLOCK_') &&
                        this.data &&
                        this.data._param_id
                    ) {
                        let isInItMethod = false;
                        let nBlock = this.getSurroundParent();
                        while (nBlock) {
                            if (nBlock.id === this.data._param_id) isInItMethod = true;
                            nBlock = nBlock.getSurroundParent();
                        }
                        console.log(isInItMethod, this);
                        if (!isInItMethod && this.colour_ !== '#9399a4') {
                            this.data.colour_ = this.colour_
                            this.colour_ = '#9399a4'
                        } else if (isInItMethod) {
                            this.colour_ = this.data.colour_
                        }
                        this.setColour(this.colour_);
                    }
                }
            };
        });

        for (let i in blocklyFnMap) {
            javascriptGenerator.forBlock[blocklyFnMap[i].type] = blocklyFnMap[i].fn;
        }
        let widgets = this.widgets;
        // 动态名称插件
        if (Blockly.Extensions.isRegistered(`dynamic_dropdown_widgetID_${widgetType.type}_extension`))
            Blockly.Extensions.unregister(`dynamic_dropdown_widgetID_${widgetType.type}_extension`);
        Blockly.Extensions.register(`dynamic_dropdown_widgetID_${widgetType.type}_extension`,
            function () {
                // @ts-ignore
                this.getInput('WIDGET_ID_dummy')
                    .appendField(new Blockly.FieldDropdown(
                        // @ts-ignore
                        function () {
                            let options = [];
                            for (let i in widgets) {
                                if (i.startsWith(widgetType.type))
                                    options.push([widgets[i].props.__name, i]);
                            }
                            return options;
                        }), 'WIDGET_ID');
            });
        logger.groupEnd('', '');
    }

    freshState() {
        this.stateFreshCallback(structuredClone(this.state));
    }

    workspaceInject(ref: Element) {
        if (this.workspace) return;
        // @ts-ignore
        Blockly.BlockSvg.START_HAT = true;
        Blockly.setLocale(locale);


        this.workspace = Blockly.inject(ref, {
            toolbox: {
                kind: 'categoryToolbox',
                contents: [],
            },
            media: '/media',
            trashcan: false,
            zoom: {
                controls: true,
                wheel: true,
                startScale: 0.8,
                maxScale: 1.4,
                minScale: 0.5,
            },
            move: {
                scrollbars: true,
                drag: true,
                wheel: true,
            },
            grid: {
                spacing: 20,
                length: 20,
                colour: '#eeeeee',
                snap: true,
            },
            theme: 'bocchi',
            renderer: 'bocchi',
        });

        const hideOld = this.workspace?.getToolbox()?.getFlyout()?.hide;
        // @ts-ignore
        this.workspace.getToolbox().getFlyout().hide = () => {
            this.state.flyoutMode = 'none';
            this.freshState();
            if (hideOld) {
                hideOld.call(this.workspace?.getToolbox()?.getFlyout());
            }
        }
        this.workspace?.MAX_UNDO ? this.workspace.MAX_UNDO = 0 : undefined;
    }

    newToolboxItem(categoryKey: string, item: IToolboxItemState) {
        this.state.toolbox.items.map((e) => {
            if (e.key === categoryKey) {
                e.items.push(item);
            }
        })
        this.freshState();
    }

    newToolboxCategory(key: string, categoryName: string) {
        this.state.toolbox.items.push({
            label: categoryName,
            items: [],
            key: key
        });
        this.freshState();
    }

    showBlocklyFlyout(key: string) {
        this.setFocus(key);
        this.workspace?.getToolbox()?.getFlyout()?.hide();
        const flyout = this.getBlocklyFlyoutDef(key);
        logger.info('Toolbox', 'ShowBlocklyFlyout', flyout);
        this.workspace?.getToolbox()?.getFlyout()?.show(flyout);
        // hide的hook 会修改flyoutMode！！！这句不能删
        this.state.flyoutMode = 'blockly';
    }

    hideBlocklyFlyout() {
        this.workspace?.getToolbox()?.getFlyout()?.hide();
        logger.info('Toolbox', 'HideBlocklyFlyout');
        this.state.flyoutMode = 'none';
    }

    showDxFlyout(key: string) {
        this.setFocus(key);
        this.state.flyoutMode = 'dx';
    }

    toolboxClick(key: string) {
        logger.group('Toolbox', 'Click', key);
        if (this.state.flyoutMode === 'none') {
            if (!this.widgets[key]._preprocessed_widgetType().advanced.noDxFlyout)
                this.showDxFlyout(key);
            else
                this.showBlocklyFlyout(key);
        } else if (this.state.toolbox.nowFocus === key && this.state.flyoutMode === 'dx') {
            this.showBlocklyFlyout(key);
        } else if (this.state.toolbox.nowFocus === key && this.state.flyoutMode === 'blockly') {
            this.hideBlocklyFlyout();
        } else if (this.state.toolbox.nowFocus !== key && this.state.flyoutMode === 'dx') {
            if (!this.widgets[key]._preprocessed_widgetType().advanced.noDxFlyout)
                this.showDxFlyout(key);
            else
                this.showBlocklyFlyout(key);
        } else if (this.state.toolbox.nowFocus !== key && this.state.flyoutMode === 'blockly') {
            this.showBlocklyFlyout(key);
        }
        logger.groupEnd('', '');
        this.freshState();
    }

    getBlocklyFlyoutDef(key: string) {
        return this.widgets[key]._getBlocklyFlyoutDef(key);
    }

    setFocus(key: string) {
        logger.info('Editor', 'Focus', key);
        if (key === '') this.state.toolbox.nowFocus = '';
        else this.state.toolbox.nowFocus = key;
        let blocks = this.dxConfig.getStore().getData().block;
        for (let i = 0; i < blocks.length; i++) {
            if (blocks[i].focus) {
                blocks[i].focus = false;
            }
            if (blocks[i].id === key) {
                blocks[i].focus = true;
            }
        }
        const data = this.dxConfig.getStore().getData();
        data.block = blocks;
        this.dxConfig.getStore().setData(deepCopy(data));
    }

    freshToolboxName() {
        const widgetNameMapping: any = {};
        this.dxConfig.getStore().getData().block.map((block) => {
            widgetNameMapping[block.id] = block.props['__name'];
        })
        this.state.toolbox.items.map((i) => {
            i.items.map((item) => {
                item.name = widgetNameMapping[item.key];
            })
        })
        this.freshState();
    }

    freshWidgetsProps() {
        const data = this.dxConfig.getStore().getData();
        data.block.map((block) => {
            if (this.widgets[block.id]) {
                this.widgets[block.id].__config = this.dxConfig;
                this.widgets[block.id].__onEditorFreshWidgetsProps(block.props);
            }
        })
    }

    freshBlockName() {
        const blocks = this.workspace?.getAllBlocks();
        const widgetNameMapping: any = {};
        this.dxConfig.getStore().getData().block.map((block) => {
            widgetNameMapping[block.id] = block.props['__name'];
        })
        if (!blocks) {
            return;
        }
        blocks.map((block) => {
            if (block.type.startsWith('METHOD_')) {
                // @ts-ignore
                block.getField("WIDGET_ID").selectedOption[0] = widgetNameMapping[block.getField("WIDGET_ID").selectedOption[1]];                                            // @ts-ignore
                block.getField("WIDGET_ID").forceRerender();
                block.render();
            }
        })
    }

    regContextMenu() {
        regDxContextMenu(this.dxConfig, this);
        regToolboxItemContextMenuEditor(this);
    }

    deleteWidget(key: string) {
        console.log(key);
        if (key.startsWith('BUILTIN_')) {
            this.messageApi('error', `内置控件不可删除！(${key})`);
            return;
        }
        const [blocklyBlockTypes] = this.widgets[key]._getBlocklyBlockDef();
        let blocksCnt = 0;
        blocklyBlockTypes.map((e: any) => {
            console.log(e.type);
            if (this.workspace) {
                const blocks = this.workspace.getBlocksByType(e.type);
                blocksCnt += blocks.length;
            }
        });
        if (blocksCnt !== 0) {
            this.messageApi('error', `当前控件还有未删除的积木！（约${blocksCnt}个）`);
            return;
        }
        // 删掉他的dx
        let blocks = this.dxConfig.getStore().getData().block;
        blocks = blocks.filter(function (item) {
            return item.id !== key;
        });
        const data = deepCopy(this.dxConfig.getStore().getData());
        data.block = blocks;
        this.dxConfig.getStore().setData(data);
        // 删掉他的toolbox
        this.state.toolbox.items.map((value, index) => {
            this.state.toolbox.items[index].items = value.items.filter((e) => {
                return e.key !== key;
            })
        })
        this.widgetCount--;
        this.freshState();
    }

    saveWorkToJson(): IWorkData {
        let workJson: IWorkData = {
            dxStore: this.dxConfig.getStore().getData(),
            scriptCodes: this.scriptCodes,
            // @ts-ignore
            blocks: Blockly.serialization.workspaces.save(this.workspace),
            workName: this.headerState.workName,
            widgetList: []
        };
        for (let i in this.widgets) {
            workJson.widgetList.push(i);
        }
        return workJson;
    }

    init() {
        for (let widget in this.widgetTypes) {
            Blockly.Extensions.unregister(`dynamic_dropdown_widgetID_${widget}_extension`);
        }
        this.dxConfig.resetConfig(dooringxDefaultConfig);
        this.widgets = {};
        this.state = <IEditorState>{};
        this.state.toolbox = <IToolboxState>{};
        this.state.toolbox.nowFocus = 'screen';
        this.state.toolbox.items = [];
        this.state.flyoutMode = 'none';
        this.widgetTypes = {};
        this.scriptCodes = {};
        this.newToolboxCategory('feature', '功能');
        this.newToolboxCategory('ui', '界面');
        this.importBuiltinWidgets();
    }

    loadWorkFromJson(data: IWorkData) {
        this.init();
        // 载入作品名
        this.headerState.workName = data.workName;
        // 先载入控件们
        for (let scriptId in data.scriptCodes) {
            logger.info('load', 'script', scriptId);
            this.importWidgetFromCode(data.scriptCodes[scriptId]);
        }
        // 先加载组件们
        data.widgetList.map((widgetId) => {
            let widgetType = widgetId.split('-')[0];
            this.widgets[widgetId] = new this.widgetTypes[widgetType]({id: widgetId});
            this.newToolboxItem('ui', {
                key: widgetId,
                name: this.widgets[widgetId].props.__name,
                icon: this.widgets[widgetId]._preprocessed_widgetType().icon,
                color: this.widgets[widgetId]._preprocessed_widgetType().color
            })
        })
        this.widgetCount = data.dxStore.block.length;
        // 导入dooringx
        this.dxConfig.store.setData(data.dxStore);
        this.state.dooringxMode = 'edit';
        this.freshState();
        // @ts-ignore
        Blockly.serialization.workspaces.load(data.blocks, this.workspace);
        this.freshBlockName();
    }

    workToBewc() {
        let bewc: IBewc = {
            dxStore: this.dxConfig.getStore().getData(),
            blockCode: javascriptGenerator.workspaceToCode(this.workspace),
            scriptCodes: this.scriptCodes,
            widgetList: [],
        }
        for (let i in this.widgets) {
            bewc.widgetList.push(i);
        }
        return bewc;
    }

    bewcToUrl() {
        const url = window.URL || window.webkitURL || window;
        const blob = new Blob([JSON.stringify(this.workToBewc())]);
        return url.createObjectURL(blob)
    }
}

function useEditorState(editor: Editor) {
    const [state, setState] = useState(editor.state);
    editor.stateFreshCallback = (_state) => {
        setState(_state);
    }
    return [state];
}

export {Editor, useEditorState};