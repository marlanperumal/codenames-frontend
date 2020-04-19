import React, { useState, useEffect } from "react"
import { useParams, useHistory, Link } from "react-router-dom"
import axios from "axios"
import styled from "styled-components"
import io from "socket.io-client"

const socket = io()

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
    width: 120px;
    height: 50px;
    background-color: white;
`

function arrayToObject(arr, idKey) {
    return arr.reduce((obj, item) => ({ ...obj, [item[idKey]]: item }), {})
}

function Game() {
    const [cards, setCards] = useState({})
    const [cardGrid, setCardGrid] = useState([])
    const [revealBoard, setRevealBoard] = useState(false)

    const { gameId } = useParams()
    const history = useHistory()

    useEffect(() => {
        socket.emit("join", {room: gameId})
        socket.on("message", (msg) => {console.log(msg)})
        
        return () => {
            socket.off("message")
            socket.emit("leave", {room: gameId})
        }
    }, [gameId])

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
            setCards(newCards)
            setCardGrid(newCardGrid)
        }
        
        socket.on("cards", (cards) => {refreshCards(cards)})

        return () => {socket.off("cards")}
    }, [])
    
    useEffect(() => {
        function updateCard(card) {
            setCards((cards) => ({
                ...cards,
                [card.id]: {
                    ...cards[card.id],
                    ...card,
                },
            }))
        }
        socket.on("card", (card) => {updateCard(card)})
        return () => {socket.off("card")}
    }, [])

    

    async function newGame() {
        const response = await axios.post("/api/games")
        const game = response.data
        setCardGrid([])
        history.push(`/${game.id}`)
    }

    async function selectCard(cardId) {
        socket.emit("select-card", {room: gameId, card: cardId})
    }

    return (
        <Container>
            <Row>
                <Link to="/">
                    <Button>Home</Button>
                </Link>
                <Button onClick={() => setRevealBoard(!revealBoard)}>
                    {revealBoard ? "Conceal" : "Reveal"}
                </Button>
                <Button onClick={() => newGame()}>New Game</Button>
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

export default Game
