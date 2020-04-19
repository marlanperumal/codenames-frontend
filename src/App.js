import React from "react"
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from "react-router-dom"

import Game from "./Game"
import Home from "./Home"

function App() {
    return (
        <Router>
            <Switch>
                <Route path="/:gameId">
                    <Game/>
                </Route>
                <Route path="/">
                    <Home/>
                </Route>
            </Switch>
        </Router>
    )
}

export default App
