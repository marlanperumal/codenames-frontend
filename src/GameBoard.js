import React, { useState, useEffect } from "react"
import styled from "styled-components"
import socket from "./socket"
import { teamColors } from "./config"
import TeamStatus from "./TeamStatus"

const StyledGameBoard = styled.div`
    padding: 24px;
    display: flex;
    flex-grow: 3;
    flex-flow: column nowrap;
    align-items: center;
`

const Row = styled.div`
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
`

const Card = styled.button`
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    margin: 4px;
    padding: 8px;
    text-transform: uppercase;
    font-size: 1em;
    font-family: inherit;
    background: ${props =>
        props.revealed || props.selected
            ? teamColors[props.team]
            : "linear-gradient(45deg, #999, #ccc)"};
    color: ${props =>
        props.revealed
            ? "white"
            : props.selected
            ? "rgba(0, 0, 0, 0)"
            : "black"};
    border-style: solid;
    border-width: 4px;
    border-color: ${props => (props.selected ? "black" : "#ddd")};
    border-radius: 8px;
    width: 120px;
    height: 90px;
    box-shadow: 4px 4px 3px rgba(0, 0, 0, 0.25);
    transition: all 0.2s ease-out;
    cursor: pointer;

    &:hover {
        border-color: ${props => (props.selected ? "black" : "white")};
        color: ${props => !props.revealed && props.selected && "#ccc"};
        background: ${props =>
            !props.revealed &&
            !props.selected &&
            "linear-gradient(45deg, #AAA, white)"};
        transform: ${props =>
            !(props.selected || props.revealed) &&
            "rotateX(10deg) rotateY(10deg)"};
        box-shadow: ${props =>
            !(props.selected || props.revealed) &&
            "-3px 5px 2px rgba(0,0,0,0.5)"};
    }
`

function arrayToObject(arr, idKey) {
    return arr.reduce((obj, item) => ({ ...obj, [item[idKey]]: item }), {})
}

function GameBoard({ roomId, isSpyMaster, gameComplete, team }) {
    const [cards, setCards] = useState({})
    const [cardGrid, setCardGrid] = useState([])

    useEffect(() => {
        function refreshCards(cards) {
            const newCards = arrayToObject(cards, "id")
            const newCardGrid = []
            const cardsPerRow = 5
            for (let i = 0; i < cards.length / cardsPerRow; i++) {
                const start = i * cardsPerRow
                newCardGrid.push(
                    cards
                        .slice(start, start + cardsPerRow)
                        .map(item => item.id),
                )
            }
            setCardGrid([])
            setCards(newCards)
            setCardGrid(newCardGrid)
        }

        socket.on("cards", cards => {
            refreshCards(cards)
        })

        return () => {
            socket.off("cards")
        }
    }, [])

    async function selectCard(cardId) {
        socket.emit("select-card", { card: cardId })
    }

    useEffect(() => {
        function updateCard(card) {
            setCards(cards => ({
                ...cards,
                [card.id]: {
                    ...cards[card.id],
                    ...card,
                },
            }))
        }
        socket.on("card", card => {
            updateCard(card)
        })
        return () => {
            socket.off("card")
        }
    }, [])

    return (
        <StyledGameBoard>
            {cardGrid.map((row, rowId) => (
                <Row key={rowId}>
                    {row.map(cardId => {
                        const card = cards[cardId]
                        return (
                            <Card
                                className="card"
                                key={cardId}
                                team={card.team}
                                revealed={
                                    (isSpyMaster && !card.selected) ||
                                    gameComplete
                                }
                                selected={card.selected}
                                disabled={
                                    isSpyMaster || card.selected || gameComplete
                                }
                                onClick={() => selectCard(cardId)}
                            >
                                {card.word}
                            </Card>
                        )
                    })}
                </Row>
            ))}
            <TeamStatus roomId={roomId} cards={cards} />
        </StyledGameBoard>
    )
}

export default GameBoard
