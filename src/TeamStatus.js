import React from "react"
import styled from "styled-components"
import socket from "./socket"
import { teamColors } from "./config"

const StyledTeamCard = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 4px;
    padding: 8px;
    text-transform: uppercase;
    font-size: 1em;
    font-family: inherit;
    background: ${props => teamColors[props.team]};
    color: white;
    border-style: solid;
    border-width: 4px;
    border-color: #ddd;
    border-radius: 8px;
    width: 120px;
    height: 90px;
    box-shadow: 4px 4px 3px rgba(0, 0, 0, 0.25);
    cursor: pointer;
`

const Row = styled.div`
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
`

function TeamCard({ team, cardsLeft }) {
    async function switchTeam(team) {
        socket.emit("switch-team", { team: team })
    }

    return (
        <StyledTeamCard
            className="card"
            team={team}
            onClick={() => switchTeam(team)}
        >
            <div>{cardsLeft}</div>
        </StyledTeamCard>
    )
}

function TeamStatus({ teamStatus }) {
    return (
        <>
            <h3 style={{ marginTop: "12px" }}>Cards Left</h3>
            <Row>
                {Object.keys(teamStatus).map(team => (
                    <TeamCard
                        team={team}
                        cardsLeft={teamStatus[team]}
                        key={team}
                    />
                ))}
            </Row>
        </>
    )
}

export default TeamStatus
