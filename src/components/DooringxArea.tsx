import {
    Container,
    innerContainerDragUp,
    LeftConfig,
    ContainerWrapper, UserConfig,
} from 'dooringx-lib';
import {IStoreData} from "dooringx-lib/dist/core/store/storetype";
import {IEditorState} from "../bocchi/editor.ts";
import './DooringxArea.css'
export interface IDooringxAreaProps {
    dxConfig: UserConfig,
    dxState: IStoreData,
    state: IEditorState
}

function DooringxArea(props: IDooringxAreaProps) {
    return (
        <div {...innerContainerDragUp(props.dxConfig)} style={{width: '100%'}}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: `calc(100vh - 52px)`,
                    width: '100%',
                }}
            >
                <div style={{height: '100%'}}>
                    <LeftConfig config={props.dxConfig} showName={true}></LeftConfig>
                </div>
                <ContainerWrapper config={props.dxConfig}>
                    <>
                        <Container
                            state={props.dxState}
                            config={props.dxConfig}
                            context={'edit'}
                            editContainerStyle={{
                                'boxShadow': '0 2px 6px rgba(26,15,41,.3)'
                            }}
                        >
                        </Container>
                    </>
                </ContainerWrapper>
            </div>
        </div>
    );
}

export default DooringxArea;
