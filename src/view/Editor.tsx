import {Layout, message} from "antd";
import BocchiHeader from "../components/Header.tsx";
import {userEditor} from "../bocchi/userEditor.ts";
import './Editor.css'
import Toolbox from "../components/Toolbox.tsx";
import WidgetFlyout from "../components/WidgetFlyout.tsx";
import Workspace from "../components/Workspace.tsx";
import DooringxArea from "../components/DooringxArea.tsx";
import {useStoreState} from "dooringx-lib";
import {useEditorState} from "../bocchi/editor.ts";
import 'dooringx-lib/dist/dooringx-lib.esm.css'
import Blockly, {minimalist} from "blockly";
import {javascriptGenerator} from 'blockly/javascript';
import EditorPlayer from "../components/EditorPlayer.tsx";

const {Header, Content, Sider} = Layout;

function Editor() {
    const [messageApi, contextHolder] = message.useMessage();
    const [dxState] = useStoreState(userEditor.dxConfig);
    const [state] = useEditorState(userEditor);
    userEditor.messageApi = (type, ...msg) => {
        messageApi[type as keyof typeof messageApi](...msg);
    };
    // for Test
    // @ts-ignore
    window["editor"] = userEditor;
    // @ts-ignore
    window["Blockly"] = Blockly;
    // @ts-ignore
    window['javascriptGenerator'] = javascriptGenerator;
    return (
        <>
            {contextHolder}
            <Layout className={'layout'}>
                <Header className={'header'}>
                    <BocchiHeader state={state} editor={userEditor}/>
                </Header>
                <Layout>
                    <Sider width={'700px'} className="aside">
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                backgroundColor: 'rgb(245, 245, 245)',
                            }}
                        >
                            {
                                userEditor.state.dooringxMode === 'edit' ?
                                    <DooringxArea
                                        state={state}
                                        dxState={dxState}
                                        dxConfig={userEditor.dxConfig}
                                    /> :
                                    <EditorPlayer editor={userEditor}/>
                            }
                        </div>
                    </Sider>
                    <Content>
                        <div style={{width: '100%', display: 'flex', height: '100%'}}>
                            <Toolbox
                                state={state}
                                onClick={(key) => {
                                    userEditor.toolboxClick(key);
                                }}
                            ></Toolbox>
                            <div style={{width: '100%', height: '100%'}}>
                                <WidgetFlyout
                                    state={state}
                                    dxState={dxState}
                                    dxConfig={userEditor.dxConfig}
                                ></WidgetFlyout>
                                <Workspace editor={userEditor}/>
                            </div>
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </>
    )
}

export default Editor;