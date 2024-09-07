bocchi.scriptID = 'WEB_UTILS'
class WEB_UTILS extends BocchiWidget {
    constructor(arg) {
        super(arg);
        const getWindowInfo = () => {
            const windowInfo = {
                width: window.innerWidth,
                hight: window.innerHeight
            }
            this.emit('onPageSizeChange',windowInfo.width,windowInfo.hight);
        };
        const debounce = (fn, delay) => {
            let timer;
            return function() {
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(() => {
                    fn();
                }, delay);
            }
        };
        const cancalDebounce = debounce(getWindowInfo, 500);
        
        window.addEventListener('resize', cancalDebounce);
    }

    widgetType() {
        let widgetType = super.widgetType();
        widgetType.type = 'WEB_UTILS';
        widgetType.name = '按钮';
        widgetType.methods.push({
            key: "getPageWidth",
            label: "获取页面的宽",
            params: [],
            valueType:'number'
        })
        widgetType.methods.push({
            key: "getPageHeight",
            label: "获取页面的高",
            params: [],
            valueType:'number'
        })
        widgetType.emit.push({
            key: "onPageSizeChange",
            label: "页面宽高改变",
            params: [
                {
                    key:'width',
                    label:'宽',
                    valueType:'number',
                },
                {
                    key:'height',
                    label:'高',
                    valueType:'number',
                }
            ],
        })
        return widgetType;
    }

    getPageWidth(){
        return document.body.clientWidth;
    }
    getPageHeight(){
        return document.body.clientHeight;
    }

    render(){
        return <div/>;
    }
}

bocchi.exportWidgets = [WEB_UTILS];