import {Route, Routes} from "react-router-dom";
import NotFound from "./view/NotFound.tsx";
import React from "react";
import Fallback from "./view/Fallback.tsx";

const EditorView = React.lazy(() => import('./view/Editor.tsx'))
const PlayerView = React.lazy(() => import('./view/Player.tsx'))

function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/" element={
                    <React.Suspense fallback={<Fallback/>}>
                        <EditorView/>
                    </React.Suspense>
                }/>
                <Route path="/player" element={
                    <React.Suspense fallback={<Fallback/>}>
                        <PlayerView/>
                    </React.Suspense>
                }/>
                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </div>
    )
}

export default App;