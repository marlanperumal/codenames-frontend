import React from "react"
import styled from "styled-components"
import { teamColors } from "./config"

const StyledTeamList = styled.div`
    display: flex;
    flex-flow: column nowrap;
    flex: 1;
`

const TeamMember = styled.div`
    margin: 2px;
    padding: 1px;
    text-align: center;
    color: ${props => (props.isSpyMaster ? "white" : "black")};
    background: ${props => teamColors[props.team]};
    border-radius: 4px;
    color: #ccc;
`

function TeamList({ players, team }) {
    return (
        <StyledTeamList>
            {players
                .filter(player => player.current_team === team)
                .map((player, i) => (
                    <TeamMember
                        key={i}
                        team={team}
                        isSpyMaster={player.is_spymaster}
                    >
                        {player.is_spymaster ? "🕶️" : "🔍"} {player.name}
                    </TeamMember>
                ))}
        </StyledTeamList>
    )
}

export default TeamList
