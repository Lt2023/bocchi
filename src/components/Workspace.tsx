import 'blockly/blocks';
import {useEffect} from 'react';
import {useRef} from 'react';
import './Workspace.css';
import {Editor} from "../bocchi/editor.ts";

export interface WorkspaceProps {
    editor: Editor
}

function Workspace(props: WorkspaceProps) {
    let blocklyDiv = useRef(null);
    useEffect(() => {
        if (blocklyDiv.current) {
            props.editor.workspaceInject(blocklyDiv.current);
        }
    }, [blocklyDiv]);

    return (<>
        <div ref={blocklyDiv} className={'blocklyDiv'}></div>
    </>)
}

export default Workspace;
