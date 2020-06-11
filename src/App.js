import React, {useState} from "react"
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from "react-router-dom"

import Room from "./Room"
import Home from "./Home"

function App() {
    const [name, setName] = useState(localStorage.getItem("name") || "PLAYER")

    const saveName = (name) => {
        localStorage.setItem("name", name)
        setName(name)
    }

    return (
        <Router>
            <Switch>
                <Route path="/:roomId">
                    <Room name={name}/>
                </Route>
                <Route path="/">
                    <Home setName={saveName} name={name}/>
                </Route>
            </Switch>
        </Router>
    )
}

export default App
