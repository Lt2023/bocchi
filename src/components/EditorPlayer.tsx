import './EditorPlayer.css'
import {Editor} from "../bocchi/editor.ts";

export interface IEditorPlayerProps {
    editor: Editor
}

function EditorPlayer(props: IEditorPlayerProps) {
    let bewcUrl = props.editor.bewcToUrl();
    return (
        <iframe
            src={'/player?bewcUrl=' + bewcUrl}
            className={'editor-player-iframe'}
        ></iframe>
    )
}

export default EditorPlayer;