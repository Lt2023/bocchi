import {useRef, useState} from 'react';
import './ToolboxItem.css';
import {onToolboxItemContextMenu} from "../bocchi/contextMenu.tsx";

export interface IToolboxItemProps {
    nowClick: number,
    color: string,
    onClick: () => void,
    name: string,
    icon: string,
    widgetKey: string
}

function ToolboxItem(props: IToolboxItemProps) {
    const [hover, setHover] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={ref}
            className={'toolbox-item'}
            style={{
                backgroundColor: (props.nowClick === 2)
                    ? props.color
                    : (hover || (props.nowClick === 1))
                        ? props.color + '22'
                        : '',
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={props.onClick}
            onContextMenu={(e) => {
                onToolboxItemContextMenu(e, ref, props.widgetKey);
            }}
        >
            <div className={'toolbox-item-icon'}>
                <img src={props.icon} alt={'toolbox-item-icon'} width={'24px'} height={'24px'}/>
            </div>
            <span
                style={{
                    color: (props.nowClick === 2)
                        ? '#ffffff'
                        : '#33383d',
                }}
                className={'toolbox-item-text'}
            >
             {props.name}
            </span>
        </div>
    );
}

export default ToolboxItem;
