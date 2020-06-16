import React from "react"
import styled from "styled-components"
import { lightTeamColors, teamColors } from "./colors"

const CardButton = styled.button`
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    margin: 4px;
    padding: 8px;
    text-transform: uppercase;
    font-size: 1em;
    font-family: inherit;
    border-style: solid;
    border-width: 4px;
    border-radius: 8px;
    width: 120px;
    height: 90px;
    box-shadow: 4px 4px 3px grey;
    transition: color ease-in-out 150ms;
`

const NormalCard = styled(CardButton)`
    background-color: ${(props) => (props.revealed || props.selected) ? teamColors[props.team] : "#EEEEEE"};
    border-color: ${(props) => props.selected ? "black" : "white"};
    color: ${props => ((props.revealed) ? "white" : (props.selected) ? "rgba(0, 0, 0, 0)" : "black")};

    &:hover {
        cursor: pointer;
        border-color: ${(props) => !props.selected && "greenyellow"};
        color: ${(props) => (!props.revealed && props.selected) && "#CCC"};
    }
`

const SpyMasterCard = styled(CardButton)`
    background-color: ${(props) => props.selected ? "#EEEEEE" : lightTeamColors[props.team]};
    border-color: ${(props) => props.selected ? "black" : "white"};
    color: ${(props) => props.selected ? teamColors[props.team] : props.team === "DEATH" ? "white" : "black"};
`

function Card({ team, isSpyMaster, selected, revealed, disabled, onClick, children }) {
    if (isSpyMaster) {
        return (
            <SpyMasterCard
                team={team}
                selected={selected}
                revealed={revealed}
                disabled
            >
                {children}
            </SpyMasterCard>
        )
    }

    return (
        <NormalCard
            team={team}
            selected={selected}
            revealed={revealed}
            disabled={disabled}
            onClick={() => onClick()}
        >
            {children}
        </NormalCard>
    )
}

export default Card
