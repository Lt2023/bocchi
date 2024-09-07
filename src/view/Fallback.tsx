import './Fallback.css'

function Fallback() {
    return (
        <div className="loading">
            <div className="spinner">
                <div className="double-bounce1"></div>
                <div className="double-bounce2"></div>
            </div>
            <h5 style={{
                'textAlign': 'center'
            }}>加载中......</h5>
        </div>
    )
}

export default Fallback;