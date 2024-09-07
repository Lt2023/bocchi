// @ts-nocheck
import Blockly from "blockly";
import {unmountToolboxContextMenu} from "../contextMenu.tsx";
import {unmountContextMenu} from "dooringx-lib";

export function blocklyHooks() {
    const oldStartDraggingBlock = Blockly.Gesture.prototype.startDraggingBlock;
    Blockly.Gesture.prototype.startDraggingBlock = function () {
        if (this.startBlock) {
            if (this.startBlock.outputConnection && this.startBlock.outputConnection.targetConnection) {
                if (
                    this.startBlock.type.startsWith('CODE_PARAM_BLOCK_') &&
                    this.startBlock.outputConnection.targetConnection.check[0] === this.startBlock.outputConnection.check[1]
                ) {
                    const blockDom = Blockly.Xml.blockToDom(this.targetBlock);
                    const block = Blockly.Xml.domToBlock(blockDom, Blockly.getMainWorkspace());
                    block.data = {};
                    block.data._param_id = this.startBlock.outputConnection.targetConnection.sourceBlock_.id;
                    console.log(block.data);
                    let surfaceXy = this.targetBlock.getRelativeToSurfaceXY();
                    block.moveBy(surfaceXy.x, surfaceXy.y);
                    block.setShadow(false);
                    block.select();
                    block.outputConnection.setCheck([block.outputConnection.getCheck()[0]])
                    this.targetBlock = block;
                }
            }
        }
        oldStartDraggingBlock.apply(this);
    }
    const oldShowContextMenu = Blockly.WorkspaceSvg.prototype.showContextMenu;
    Blockly.WorkspaceSvg.prototype.showContextMenu = function (arg) {
        unmountToolboxContextMenu();
        unmountContextMenu();
        oldShowContextMenu.call(this, arg);
    }
}