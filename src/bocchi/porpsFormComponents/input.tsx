import {Col, Input, Row} from 'antd';
import {deepCopy, UserConfig} from "dooringx-lib";
import {IBlockType} from "dooringx-lib/dist/core/store/storetype";
import {CreateOptionsRes} from "dooringx-lib/dist/core/components/formTypes";
import {useMemo} from 'react'

export interface InputType {
    label: string;
    receive?: string;
}

export interface InputMap {
    input: InputType;
}

interface InputProps {
    data: CreateOptionsRes<InputMap, 'input'>;
    current: IBlockType;
    config: UserConfig;
}

function PInput(props: InputProps) {
    const option = useMemo(() => {
        return props.data?.option || {};
    }, [props.data]);
    return (
        <div
            style={{padding: '10px 20px'}}
        >
            <span
                style={{
                    lineHeight: '30px',
                }}
            >
              {(option as any)?.label || '文字'}：
            </span>
            <Input
                value={props.current.props[(option as any).receive] || ''}
                onChange={(e) => {
                    const receive = (option as any).receive;
                    const cloneData = deepCopy(props.config.store.getData());
                    const newBlock = cloneData.block.map((v: IBlockType) => {
                        if (v.id === props.current.id) {
                            v.props[receive] = e.target.value;
                        }
                        return v;
                    });
                    props.config.store.setData({...cloneData, block: [...newBlock]});
                }}
                style={{
                    margin:'5px 0 0 0'
                }}
            ></Input>
        </div>
        // <Row style={{padding: '10px 20px'}}>
        //     <Col span={10} style={{lineHeight: '30px'}}>
        //         {(option as any)?.label || '文字'}：
        //     </Col>
        //     <Col span={14} style={{
        //         display: 'flex',
        //         alignItems: 'center',
        //         justifyContent: 'flex-end',
        //     }}>
        //
        //     </Col>
        // </Row>
    );
}

export default PInput;
