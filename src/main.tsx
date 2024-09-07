import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import bocchiThemeToken from './assets/bocchi_theme_token.json'
import {ConfigProvider, theme, ThemeConfig} from "antd";
import {BrowserRouter} from "react-router-dom";

const themeConfig: ThemeConfig = {
    cssVar: {key: 'app'},
    ...bocchiThemeToken
};
ReactDOM.createRoot(document.getElementById('root')!).render(
    //<React.StrictMode>
        <BrowserRouter>
            <ConfigProvider theme={themeConfig}>
                <App/>
            </ConfigProvider>
        </BrowserRouter>
    //</React.StrictMode>,
)
