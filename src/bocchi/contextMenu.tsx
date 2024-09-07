import {ReactElement, RefObject, useState} from "react";
import {UserConfig} from "dooringx-lib";
import {Button} from "antd";
import {unmountComponentAtNode} from "react-dom";
import ReactDOM from "react-dom";
import Blockly from "blockly";
import {unmountContextMenu} from "dooringx-lib";
import {Editor} from "./editor.ts";

export function regDxContextMenu(config: UserConfig, editor: Editor) {
    const contextMenuState = config.getContextMenuState();
    const unmountContextMenu = contextMenuState.unmountContextMenu;
    const ContextMenu = () => {
        Blockly.ContextMenu.hide();
        toolboxContextMenuState.unmountContextMenu();
        const handleclick = () => {
            unmountContextMenu();
        };
        return (
            <div
                style={{
                    left: contextMenuState.left,
                    top: contextMenuState.top,
                    position: 'fixed',
                }}
            >
                <div

                    style={{width: '100%'}}
                    onClick={() => {
                        editor.deleteWidget(config.focusState.blocks[0].id);
                        handleclick();
                    }}
                >
                    <Button danger>删除控件</Button>
                </div>
            </div>
        );
    };
    contextMenuState.contextMenu = <ContextMenu></ContextMenu>;
}

export interface IToolboxContextMenuProps {
    widgetKey: string,
    editor: Editor | null
}

const ToolboxContextMenu = (props: IToolboxContextMenuProps) => {
    console.log(props);
    Blockly.ContextMenu.hide();
    unmountContextMenu();
    const handleclick = () => {
        unmountToolboxContextMenu();
    };
    return (
        <div
            style={{
                left: toolboxContextMenuState.left,
                top: toolboxContextMenuState.top,
                position: 'fixed',
                zIndex: '999999'
            }}
        >
            <div
                style={{width: '100%'}}

                onClick={() => {
                    props.editor?.deleteWidget(props.widgetKey);
                    handleclick();
                }}
            >
                <Button
                    danger


                >
                    删除控件
                </Button>
            </div>
        </div>
    );
};

export interface ContextMenuStateProps {
    left: number;
    top: number;
    menu: HTMLElement | null;
    parent: HTMLDivElement | null;
    unmountContextMenu: () => void;
    observer: null | MutationObserver;
    initLeft: number;
    initTop: number;
    state: boolean;
    editor: Editor | null

}

export const toolboxContextMenuState: ContextMenuStateProps = {
    left: 0,
    top: 0,
    menu: null,
    parent: null,
    unmountContextMenu: unmountToolboxContextMenu,
    observer: null,
    initLeft: 0,
    initTop: 0,
    state: false,
    editor: null
};

export function regToolboxItemContextMenuEditor(editor: Editor) {
    toolboxContextMenuState.editor = editor;
}

export function unmountToolboxContextMenu() {
    toolboxContextMenuState.state = false;
    if (toolboxContextMenuState.observer) {
        toolboxContextMenuState.observer.disconnect();
    }
    if (toolboxContextMenuState.menu && toolboxContextMenuState.parent) {
        try {
            // TODO 此处会报错！我不知道为什么，所以就给他忽略了！ 忽略后不影响使用
            unmountComponentAtNode(toolboxContextMenuState.parent);
            toolboxContextMenuState.menu.removeChild(toolboxContextMenuState.parent);
        } catch (e) { /* empty */
        }
        toolboxContextMenuState.parent = null;
    }
}

export const isMac = () => {
    const isMac = /macintosh|mac os x/i.test(navigator.userAgent);
    if (isMac) {
        return true;
    }
    return false;
};
document.onclick = (e) => {
    unmountContextMenu();
    unmountToolboxContextMenu();
}

export function onToolboxItemContextMenu(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ref: RefObject<HTMLDivElement>,
    key: string
) {
    e.preventDefault();
    Blockly.ContextMenu.hide()
    unmountContextMenu();
    toolboxContextMenuState.unmountContextMenu();
    const config: MutationObserverInit = {
        attributes: true,
    };
    const callback: MutationCallback = (mutationsList) => {
        if (isMac()) {
            //mac 有bug
            toolboxContextMenuState.unmountContextMenu();
        } else {
            for (let mutation of mutationsList) {
                if (mutation.type === 'attributes') {
                    const curLeft = parseFloat((mutation.target as HTMLDivElement).style.left);
                    const curTop = parseFloat((mutation.target as HTMLDivElement).style.top);
                    const diffL = (curLeft - toolboxContextMenuState.initLeft);
                    const diffT = (curTop - toolboxContextMenuState.initTop);
                    toolboxContextMenuState.initLeft = curLeft;
                    toolboxContextMenuState.initTop = curTop;
                    toolboxContextMenuState.left = toolboxContextMenuState.left + diffL;
                    toolboxContextMenuState.top = toolboxContextMenuState.top + diffT;
                }
            }
        }
    };
    toolboxContextMenuState.state = true;
    toolboxContextMenuState.observer = new MutationObserver(callback);
    if (ref.current) {
        //记录初始值
        toolboxContextMenuState.initTop = parseFloat(ref.current.style.top);
        toolboxContextMenuState.initLeft = parseFloat(ref.current.style.left);
        toolboxContextMenuState.observer.observe(ref.current, config);
    }
    toolboxContextMenuState.left = e.clientX;
    toolboxContextMenuState.top = e.clientY;
    if (!toolboxContextMenuState.menu) {
        toolboxContextMenuState.menu = document.createElement('div');
        document.body && document.body.appendChild(toolboxContextMenuState.menu);
    }
    if (!toolboxContextMenuState.parent) {
        toolboxContextMenuState.parent = document.createElement('div');
    }
    toolboxContextMenuState.menu.appendChild(toolboxContextMenuState.parent);
    ReactDOM.render(<ToolboxContextMenu widgetKey={key}
                                        editor={toolboxContextMenuState.editor}></ToolboxContextMenu>, toolboxContextMenuState.parent);
}