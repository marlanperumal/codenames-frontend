import React, { useState, useEffect } from "react"
import styled from "styled-components"
import socket from "./socket"
import TeamList from "./TeamList"

const StyledTeams = styled.div`
    height: 50%;
    overflow: auto;
`

const Row = styled.div`
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
`

function Teams() {
    const [players, setPlayers] = useState([])

    useEffect(() => {
        socket.on("players", players => {
            setPlayers(players)
        })

        return () => {
            socket.off("players")
        }
    }, [])

    return (
        <StyledTeams>
            <h2>Teams</h2>
            <Row>
                <TeamList players={players} team="RED" />
                <TeamList players={players} team="BLUE" />
            </Row>
            <TeamList players={players} team="NEUTRAL" />
        </StyledTeams>
    )
}

export default Teams
