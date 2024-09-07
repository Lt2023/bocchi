import './Player.css'
import {Container, Preview, useStoreState} from "dooringx-lib";
import {userPlayer} from "../bocchi/userPlayer.ts";
import {useLocation} from 'react-router-dom';
import axios from "axios";
import {logger} from "../bocchi/logger.ts";

function Player() {
    const [state] = useStoreState(userPlayer.dxConfig);
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const param = query.get('bewcUrl');
    if (param && !userPlayer.inited) {
        axios.get(param).then(async response => {
            logger.info('RunWork', 'work', response.data);
            await userPlayer.runBewc(response.data);
        })
    }
    // @ts-ignore
    window['player'] = userPlayer;
    return (
        <div className={'player-box'}>
            <div
                className={'dx-player'}
                style={{
                    width: String(state.container.width) + 'px',
                    height: String(state.container.height) + 'px',
                }}
            >
                <Container state={state} config={userPlayer.dxConfig} context="preview"></Container>
            </div>
        </div>
    );
}

export default Player;