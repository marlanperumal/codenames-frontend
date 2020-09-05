import React, { useState } from "react"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"

import Room from "./Room"
import Home from "./Home"

function App() {
    const [name, setName] = useState(localStorage.getItem("name") || "PLAYER")
    const [language, setLanguage] = useState(
        localStorage.getItem("language") || "EN",
    )

    const saveName = name => {
        localStorage.setItem("name", name)
        setName(name)
    }

    const saveLanguage = language => {
        localStorage.setItem("language", language)
        setLanguage(language)
    }

    return (
        <Router>
            <Switch>
                <Route path="/:roomId">
                    <Room name={name} />
                </Route>
                <Route path="/">
                    <Home
                        name={name}
                        setName={saveName}
                        language={language}
                        setLanguage={saveLanguage}
                    />
                </Route>
            </Switch>
        </Router>
    )
}

export default App
