import {Col, InputNumber, Row} from 'antd';
import {deepCopy, UserConfig} from "dooringx-lib";
import {IBlockType} from "dooringx-lib/dist/core/store/storetype";
import {CreateOptionsRes} from "dooringx-lib/dist/core/components/formTypes";
import {useMemo} from 'react'

export interface NumberInputType {
    label: string;
    receive?: string;
}

export interface NumberInputMap {
    numberInput: NumberInputType;
}

interface NumberInputProps {
    data: CreateOptionsRes<NumberInputMap, 'numberInput'>;
    current: IBlockType;
    config: UserConfig;
}

function PNumberInput(props: NumberInputProps) {
    const option = useMemo(() => {
        return props.data?.option || {};
    }, [props.data]);
    return (
        <Row style={{padding: '10px 20px'}}>
            <Col span={16} style={{lineHeight: '30px'}}>
                {(option as any)?.label || '数字'}：
            </Col>
            <Col span={8} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
            }}>
                <InputNumber
                    value={props.current.props[(option as any).receive] || ''}
                    onChange={(e) => {
                        const receive = (option as any).receive;
                        const cloneData = deepCopy(props.config.store.getData());
                        const newBlock = cloneData.block.map((v: IBlockType) => {
                            if (v.id === props.current.id) {
                                v.props[receive] = e;
                            }
                            return v;
                        });
                        props.config.store.setData({...cloneData, block: [...newBlock]});
                    }}
                ></InputNumber>
            </Col>
        </Row>
    );
}

export default PNumberInput;
