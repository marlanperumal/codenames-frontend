import React, { useState, useEffect } from "react"
import axios from "axios"
import styled from "styled-components"

const teamColors = {
    blue: "#1d3e6e",
    red: "#900001",
    neutral: "gray",
    death: "black",
}

const Container = styled.div`
    display: flex;
    flex-flow: column nowrap;
    background-color: #b4b4b4;
    height: 100%;
`

const Row = styled.div`
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
`

const Card = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 4px;
    padding: 8px;
    text-transform: uppercase;
    font-size: 1em;
    font-family: inherit;
    background-color: ${props =>
        props.reveal ? teamColors[props.team] : "#EEEEEE"};
    color: ${props => (props.reveal ? "white" : "auto")};
    border-style: solid;
    border-width: 4px;
    border-color: white;
    border-radius: 8px;
    width: 120px;
    height: 90px;
    box-shadow: 4px 4px 3px grey;
    /* outline: 0; */

    &:hover {
        border-color: ${props => (props.disabled ? "white" : "greenyellow")};
        cursor: ${props => (props.disabled ? "not-allowed" : "pointer")};
    }
`

const Button = styled.button`
    margin: 4px;
    font-family: inherit;
    width: 100px;
    height: 50px;
    background-color: white;
`

function arrayToObject(arr, idKey) {
    return arr.reduce((obj, item) => ({ ...obj, [item[idKey]]: item }), {})
}

function App() {
    const [cards, setCards] = useState({})
    const [cardGrid, setCardGrid] = useState([])
    const [refresh, setRefresh] = useState(false)
    const [revealBoard, setRevealBoard] = useState(false)

    async function setupBoard() {
        const response = await axios.get("/api/cards")
        const getCardsResponse = response.data
        const newCards = arrayToObject(getCardsResponse, "id")
        const newCardGrid = []
        const cardsPerRow = 5
        for (let i = 0; i < getCardsResponse.length / cardsPerRow; i++) {
            const start = i * cardsPerRow
            newCardGrid.push(
                getCardsResponse
                    .slice(start, start + cardsPerRow)
                    .map(item => item.id),
            )
        }
        setCards(newCards)
        setCardGrid(newCardGrid)
    }

    useEffect(() => {
        setupBoard()
    }, [refresh])

    async function selectCard(cardId) {
        const card = cards[cardId]
        await axios.patch(`/api/cards/${cardId}`, { selected: !card.selected })
        setCards({
            ...cards,
            [cardId]: {
                ...card,
                selected: !card.selected,
            },
        })
    }

    return (
        <Container>
            <Row>
                <Button onClick={() => setRevealBoard(!revealBoard)}>
                    {revealBoard ? "Conceal" : "Reveal"}
                </Button>
                <Button onClick={() => setRefresh(!refresh)}>Refresh</Button>
            </Row>
            {cardGrid.map((row, rowId) => (
                <Row key={rowId}>
                    {row.map(cardId => {
                        const card = cards[cardId]
                        return (
                            <Card
                                key={cardId}
                                team={card.team}
                                reveal={revealBoard || card.selected}
                                disabled={revealBoard}
                                onClick={() => selectCard(cardId)}
                            >
                                {(revealBoard || !card.selected) && card.word}
                            </Card>
                        )
                    })}
                </Row>
            ))}
        </Container>
    )
}

export default App
