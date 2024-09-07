import './Toolbox.css'
import {Collapse, CollapseProps} from 'antd';
import ToolboxItem from './ToolboxItem.jsx';
import {IEditorState} from "../bocchi/editor.ts";


export interface ToolboxProps {
    state: IEditorState,
    onClick: (key: string) => void,
}

function Toolbox(props: ToolboxProps) {
    let items: CollapseProps['items'] = [];
    for (let i = 0; i < props.state.toolbox.items.length; i++) {
        const citem = props.state.toolbox.items[i];
        items.push({
            key: citem.key,
            label: citem.label,
            children: citem.items.map((item) => {
                let nowClick = 0;
                if (props.state.toolbox.nowFocus === item.key) {
                    nowClick = 2;
                    if (props.state.flyoutMode !== 'dx' && props.state.flyoutMode !== 'blockly') {
                        nowClick = 1;
                    }
                }
                return <ToolboxItem
                    key={item.key}
                    name={item.name}
                    color={item.color}
                    icon={item.icon}
                    nowClick={nowClick}
                    widgetKey={item.key}
                    onClick={() => props.onClick(item.key)}
                />
            })
        });
    }
    return (
        <Collapse
            defaultActiveKey={['ui','feature']}
            bordered={false}
            size={'small'}
            className={'toolbox'}
            items={items}
        >
        </Collapse>
    );
}

export default Toolbox;
