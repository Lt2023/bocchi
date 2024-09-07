import {Editor, IEditorState} from "../bocchi/editor.ts";
import {Button, Input, Menu, MenuProps, Space, theme} from "antd";
import './Header.css'
interface IHeaderPackagedProps {
    state: IEditorState,
    editor: Editor
}

function Header(props: IHeaderPackagedProps) {
    const state = props.editor.headerState;
    const fn = props.editor.headerFn;
    const onMenuClick: MenuProps['onClick'] = (e) => {
        fn.menuFn(e.key);
    };
    const { token } = theme.useToken();
    return (
        <div className={'header-container'}>
            <div className={'header-item'}>
                <img src={state.appLogoUrl} alt="header-logo" className={'header-logo'}/>
                <Menu
                    selectable={false}
                    mode="horizontal"
                    items={state.menuItems}
                    style={{ background: token.colorPrimary}}
                    theme={'light'}
                    onClick={onMenuClick}
                />
            </div>
            <div className={'header-item'}>
                <Space>
                    <Button type={'primary'} danger onClick={() => fn.runFn()}>
                        {props.editor.state.dooringxMode==="edit"?'运行':'停止'}
                    </Button>
                    <Input
                        placeholder="作品名"
                        defaultValue={state.workName}
                        onChange={(e) => {
                            fn.workNameChangeFn(e.currentTarget.value);
                        }}
                    ></Input>
                </Space>
            </div>
            <div className={'header-item'}>
                <Space>
                    <Button onClick={() => fn.saveFn()}>保存</Button>
                    <span className={'version-info'}>
                        {state.appName}( {state.appVersion} )
                    </span>
                </Space>
            </div>
        </div>
    );
}

export default Header;