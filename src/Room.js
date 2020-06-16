import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import styled from "styled-components"
import io from "socket.io-client"
import ButtonWithConfirmation from "./ButtonWithConfirmation"
import "./styles/room.scss"

const socket = io()

const teamColors = {
    BLUE: "linear-gradient(45deg, #1d2e6e, #1d4e8e)",
    RED: "linear-gradient(45deg, #700, #b00)",
    NEUTRAL: "linear-gradient(45deg, #444, #777)",
    DEATH: "linear-gradient(45deg, #000, #222)",
}

const Body = styled.div`
    display: flex;
    flex-direction: column;
`

const Container = styled.div`
    display: flex;
    flex-flow: row nowrap;
    flex-grow: 1;
`

const TitleBar = styled.div`
    background-color: black;
    color: white;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    padding: 10px;
    border-bottom: solid 1px #333;
`

const Board = styled.div`
    padding: 24px;
    display: flex;
    flex-grow: 3;
    flex-flow: column nowrap;
`
const LeftPanel = styled.div`
    min-width: 200px;
    display: flex;
    flex-flow: column nowrap;
    padding: 12px;
    background-color: rgba(0, 0, 0, 0.35);
    border-right: solid 1px #333;
`

const RightPanel = styled.div`
    display: flex;
    flex-flow: column nowrap;
    min-width: 400px;
    padding: 0 24px;
    flex-flow: column nowrap;
    background-color: rgba(0, 0, 0, 0.35);
    border-left: solid 1px #333;
`

const Log = styled.div`
    flex: 1 1 auto;
`

const TeamLists = styled.div`
    display: flex;
    flex-flow: row nowrap;
`

const TeamList = styled.div`
    flex-flow: column nowrap;
    align-items: center;
    width: 50%;
    height: 100%;
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

const LogItem = styled.div`
    min-height: 20px;
    font-size: 14px;
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
            : "linear-gradient(45deg, #999, #CCC)"};
    color: ${props =>
        props.revealed
            ? "white"
            : props.selected
            ? "rgba(0, 0, 0, 0)"
            : "black"};
    border-style: solid;
    border-width: 4px;
    border-color: ${props => (props.selected ? "black" : "#DDD")};
    border-radius: 8px;
    width: 120px;
    height: 90px;
    box-shadow: 4px 4px 3px rgba(0,0,0,0.25);
    transition: all 0.2s ease-out;
    cursor: pointer;

    &:hover {
        border-color: ${props => (props.selected ? "black" : "white")};
        ${props => !props.revealed && props.selected && "color: #CCC;"}
        ${props =>
            !props.revealed &&
            !props.selected &&
            "background: linear-gradient(45deg, #AAA, white);"}
        ${props =>
            !(props.selected || props.revealed) &&
            "transform: rotateX(10deg) rotateY(10deg); box-shadow: -3px 5px 2px rgba(0,0,0,0.5);"}
    }
    
`

const confirmBecomeSpyMaster =
    "Are you sure you want to become the spy master? This will reveal all the cards to you."
const confirmBecomeNormal = "Are you sure you want to become a normal player?"
const confirmEndGame =
    "Are you sure you want to end the game and reveal all cards?"
const confirmNewGame = "Are you sure you want to start a new game?"
const confirmNavigateHome =
    "Are you sure you wish to navigate to the home page?"

function arrayToObject(arr, idKey) {
    return arr.reduce((obj, item) => ({ ...obj, [item[idKey]]: item }), {})
}

function Room({ name }) {
    const [cards, setCards] = useState({})
    const [gameId, setGameId] = useState(null)
    const [isSpyMaster, setIsSpyMaster] = useState(false)
    const [team, setTeam] = useState("NEUTRAL")
    const [messages, setMessages] = useState([])
    const [cardGrid, setCardGrid] = useState([])
    const [gameComplete, setGameComplete] = useState(null)
    const [players, setPlayers] = useState([])

    const { roomId } = useParams()

    useEffect(() => {
        if (socket.connected) {
            socket.emit("join", { room: roomId, name })
        }
        socket.on("connect", () => {
            socket.emit("join", { room: roomId, name })
        })

        return () => {
            socket.off("connect")
            socket.emit("leave", { room: roomId })
        }
    }, [roomId, name])

    useEffect(() => {
        socket.on("message", msg => {
            const now = new Date()
            const timeStr = now.toLocaleTimeString()
            const message = `[${timeStr}] ${msg}`
            setMessages(messages => {
                console.log(message)
                const logLength = 15
                let newMessages = [message, ...messages]
                if (newMessages.length > logLength) {
                    newMessages = newMessages.slice(0, logLength)
                    newMessages.push("...more")
                }
                return newMessages
            })
        })
        return () => {
            socket.off("message")
        }
    })

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

    useEffect(() => {
        socket.on("game", game => {
            setGameId(game.id)
            setGameComplete(game.complete)
        })

        return () => {
            socket.off("game")
        }
    }, [])

    useEffect(() => {
        socket.on("player", player => {
            setTeam(player.current_team)
            setIsSpyMaster(player.is_spymaster)
        })

        return () => {
            socket.off("player")
        }
    }, [])

    useEffect(() => {
        socket.on("team", team => {
            setTeam(team)
        })

        return () => {
            socket.off("team")
        }
    }, [])

    useEffect(() => {
        socket.on("players", players => {
            setPlayers(players)
        })

        return () => {
            socket.off("players")
        }
    }, [])

    useEffect(() => {
        setIsSpyMaster(false)
    }, [gameId, team])

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

    async function newGame() {
        socket.emit("new-game", { room: roomId })
    }

    async function endGame() {
        socket.emit("end-game", { room: roomId })
    }

    async function selectCard(cardId) {
        socket.emit("select-card", { room: roomId, card: cardId })
    }

    async function switchTeam(team) {
        socket.emit("switch-team", { room: roomId, team: team })
    }

    async function switchSpyMaster(team) {
        socket.emit("switch-spymaster", {
            room: roomId,
            is_spymaster: !isSpyMaster,
        })
    }

    const redLeft = Object.keys(cards).filter(
        cardId => cards[cardId].team === "RED" && !cards[cardId].selected,
    ).length
    const blueLeft = Object.keys(cards).filter(
        cardId => cards[cardId].team === "BLUE" && !cards[cardId].selected,
    ).length
    const neutralLeft = Object.keys(cards).filter(
        cardId => cards[cardId].team === "NEUTRAL" && !cards[cardId].selected,
    ).length

    return (
        <Body id="room" data-team={team}>
            <TitleBar>
                <h4>{name}</h4>
                <h4>Room Code: {roomId}</h4>
            </TitleBar>
            <Container team={team}>
                <LeftPanel>
                    <ButtonWithConfirmation
                        onClick={() => (window.location.href = "/")}
                        confirmText={confirmNavigateHome}
                    >
                        Home
                    </ButtonWithConfirmation>
                    <ButtonWithConfirmation
                        onClick={newGame}
                        confirmText={confirmNewGame}
                    >
                        New Game
                    </ButtonWithConfirmation>
                    <ButtonWithConfirmation
                        onClick={endGame}
                        disabled={gameComplete}
                        confirmText={confirmEndGame}
                    >
                        End Game
                    </ButtonWithConfirmation>
                    <ButtonWithConfirmation
                        onClick={switchSpyMaster}
                        disabled={gameComplete}
                        confirmText={
                            isSpyMaster
                                ? confirmBecomeNormal
                                : confirmBecomeSpyMaster
                        }
                    >
                        {isSpyMaster ? "Become Normal" : "Become Spy Master"}
                    </ButtonWithConfirmation>
                </LeftPanel>
                <Board>
                    {cardGrid.map((row, rowId) => (
                        <Row key={rowId}>
                            {row.map(cardId => {
                                const card = cards[cardId]
                                return (
                                    <Card
                                        className="card"
                                        key={cardId}
                                        team={card.team}
                                        playerTeam={team}
                                        revealed={
                                            (isSpyMaster && !card.selected) ||
                                            gameComplete
                                        }
                                        selected={card.selected}
                                        disabled={
                                            isSpyMaster ||
                                            card.selected ||
                                            gameComplete
                                        }
                                        onClick={() => selectCard(cardId)}
                                    >
                                        {card.word}
                                    </Card>
                                )
                            })}
                        </Row>
                    ))}
                    <Row>
                        <h3 style={{ marginTop: "12px" }}>Cards Left</h3>
                    </Row>
                    <Row>
                        <Card
                            className="card"
                            onClick={() => switchTeam("RED")}
                            revealed={true}
                            team={"RED"}
                        >
                            <div>{redLeft}</div>
                        </Card>
                        <Card
                            className="card"
                            onClick={() => switchTeam("NEUTRAL")}
                            revealed={true}
                            team={"NEUTRAL"}
                        >
                            <div>{neutralLeft}</div>
                        </Card>
                        <Card
                            className="card"
                            onClick={() => switchTeam("BLUE")}
                            revealed={true}
                            team={"BLUE"}
                        >
                            <div>{blueLeft}</div>
                        </Card>
                    </Row>
                </Board>
                <RightPanel>
                    <div style={{ height: "50%", overflow: "auto" }}>
                        <h2>Teams</h2>
                        <TeamLists>
                            <TeamList>
                                {players
                                    .filter(
                                        player => player.current_team === "RED",
                                    )
                                    .map((player, i) => (
                                        <TeamMember
                                            key={i}
                                            team="RED"
                                            isSpyMaster={player.is_spymaster}
                                        >
                                            {player.is_spymaster ? "🕶️" : "🔍"}{" "}
                                            {player.name}
                                        </TeamMember>
                                    ))}
                            </TeamList>
                            <TeamList>
                                {players
                                    .filter(
                                        player =>
                                            player.current_team === "BLUE",
                                    )
                                    .map((player, i) => (
                                        <TeamMember
                                            key={i}
                                            team="BLUE"
                                            isSpyMaster={player.is_spymaster}
                                        >
                                            {player.is_spymaster ? "🕶️" : "🔍"}{" "}
                                            {player.name}
                                        </TeamMember>
                                    ))}
                            </TeamList>
                        </TeamLists>
                        {players
                            .filter(player => player.current_team === "NEUTRAL")
                            .map((player, i) => (
                                <TeamMember
                                    key={i}
                                    team="NEUTRAL"
                                    isSpyMaster={player.is_spymaster}
                                >
                                    {player.name}
                                </TeamMember>
                            ))}
                    </div>
                    <Log>
                        <h2>Log</h2>
                        {messages.map((msg, i) => (
                            <LogItem key={i}>{msg}</LogItem>
                        ))}
                    </Log>
                </RightPanel>
            </Container>
        </Body>
    )
}

export default Room
