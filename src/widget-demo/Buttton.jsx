bocchi.scriptID = 'ANTD_BUTTON'
const {Button} = Antd;
class ANTD_BUTTON extends BocchiWidget {
    constructor(arg) {
        super(arg);
    }

    widgetType() {
        let widgetType = super.widgetType();
        widgetType.type = 'ANTD_BUTTON';
        widgetType.name = '按钮';
        widgetType.props.push(
            {
                key: 'text',
                label: '文本',
                valueType: 'string',
                defaultValue: '按钮'
            }
        )
        widgetType.emit.push({
            key: "onClick",
            label: '被点击',
            params: []
        })

        return widgetType;
    }


    render(){
        return <Button onClick={()=>{this.emit('onClick')}}>{this.props['text']}</Button>;
    }
}

bocchi.exportWidgets = [ANTD_BUTTON];