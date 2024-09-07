import {MenuProps} from "antd";
import {FileOutlined, QuestionCircleOutlined} from '@ant-design/icons';

export const menuItems: MenuProps['items'] = [
    {
        key: 'file',
        label: '文件',
        icon: <FileOutlined/>,
        children: [
            {
                key: 'new',
                label: '新建',
            },
            {
                key: 'save',
                label: '保存',
            },
            {
                key: 'open',
                label: '打开',
            },
        ],
    },
    {
        key: 'help',
        label: '帮助',
        icon: <QuestionCircleOutlined/>,
        children: [
            {
                key: 'doc',
                label: '文档',
            },
            {
                key: 'about',
                label: '关于',
            },
        ],
    },
];