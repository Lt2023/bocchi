import {RightConfig, UserConfig} from 'dooringx-lib';
import './WidgetFlyout.css';
import {IEditorState} from "../bocchi/editor.ts";
import {IStoreData} from "dooringx-lib/dist/core/store/storetype";
export interface IWidgetFlyoutProps{
    state:IEditorState,
    dxState:IStoreData,
    dxConfig:UserConfig
}
function WidgetFlyout(props:IWidgetFlyoutProps) {
    return (
        <div
            className="widget-flyout"
            style={{display: props.state.flyoutMode==='dx' ? undefined : 'none'}}
        >
            <RightConfig state={props.dxState} config={props.dxConfig}></RightConfig>
        </div>
    );
}

export default WidgetFlyout;
