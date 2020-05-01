import React, {useState} from "react"
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from "react-router-dom"

import Room from "./Room"
import Home from "./Home"

function App() {
    const [name, setName] = useState("PLAYER")
    return (
        <Router>
            <Switch>
                <Route path="/:roomId">
                    <Room name={name}/>
                </Route>
                <Route path="/">
                    <Home setName={setName} name={name}/>
                </Route>
            </Switch>
        </Router>
    )
}

export default App
