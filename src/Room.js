import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import styled from "styled-components"
import io from "socket.io-client"

const socket = io()

const teamColors = {
    BLUE: "#1d3e6e",
    RED: "#900001",
    NEUTRAL: "gray",
    DEATH: "black",
}

const backgroundColors = {
    BLUE: "lightsteelblue",
    RED: "indianred",
    NEUTRAL: "#b4b4b4",
    DEATH: "black",
}

const Container = styled.div`
    display: flex;
    flex-flow: row nowrap;
    background-color: ${props => backgroundColors[props.team]};
    height: 100%;
`

const TitleBar = styled.div`
    background-color: black;
    color: white;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    padding-left: 10px;
    padding-right: 10px;
`

const Board = styled.div`
    display: flex;
    flex-grow: 3;
    flex-flow: column nowrap;
    height: 100%;
`

const RightPanel = styled.div`
    display: flex;
    flex-flow: column nowrap;
    min-width: 400px;
    padding-top: 10px;
    padding-left: 10px;
    padding-right: 10px;
    flex-flow: column nowrap;
    background-color: white;
    height: 100%;
`

const Log = styled.div`
    height: 50%;
`

const TeamLists = styled.div`
    height: 50%;
    width: 100%;
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
    margin: 1px;
    padding: 1px;
    text-align: center;
    color: ${props => props.isSpyMaster ? "white" : "black"};
    background-color: ${props => props.isSpyMaster ? teamColors[props.team] : backgroundColors[props.team]};
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
    background-color: ${(props) => (props.revealed || props.selected) ? teamColors[props.team] : "#EEEEEE"};
    color: ${props => ((props.revealed) ? "white" : "black")};
    border-style: solid;
    border-width: 4px;
    border-color: ${props => props.selected ? "black" : "white"};
    border-radius: 8px;
    width: 120px;
    height: 90px;
    box-shadow: 4px 4px 3px grey;

    &:hover {
        border-color: ${props => (!props.selected && "greenyellow")};
        cursor: pointer;
    }
`

const Button = styled.button`
    margin: 4px;
    font-family: inherit;
    width: 120px;
    height: 90px;
    background-color: white;
`

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
            socket.emit("join", {room: roomId, name})
        }
        socket.on("connect", () => {
            socket.emit("join", {room: roomId, name})
        })

        return () => {
            socket.off("connect")
            socket.emit("leave", {room: roomId})
        }
    }, [roomId, name])

    useEffect(() => {
        socket.on("message", (msg) => {
            const now = new Date()
            const timeStr = now.toLocaleTimeString()
            const message = `[${timeStr}] ${msg}`
            setMessages((messages) => {
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
        
        socket.on("cards", (cards) => {refreshCards(cards)})

        return () => {socket.off("cards")}
    }, [])

    useEffect(() => {
        socket.on("game", (game) => {
            setGameId(game.id)
            setGameComplete(game.complete)
        })

        return () => {socket.off("game")}
    }, [])

    useEffect(() => {
        socket.on("player", (player) => {
            setTeam(player.current_team)
            setIsSpyMaster(player.is_spymaster)
        })

        return () => {socket.off("player")}
    }, [])

    useEffect(() => {
        socket.on("team", (team) => {setTeam(team)})

        return () => {socket.off("team")}
    }, [])

    useEffect(() => {
        socket.on("players", (players) => {setPlayers(players)})

        return () => {socket.off("players")}
    }, [])

    useEffect(() => {
        setIsSpyMaster(false)
    }, [gameId, team])

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
        socket.emit("new-game", {room: roomId})
    }
    
    async function endGame() {
        socket.emit("end-game", {room: roomId})
    }
    
    async function selectCard(cardId) {
        socket.emit("select-card", {room: roomId, card: cardId})
    }
    
    async function switchTeam(team) {
        socket.emit("switch-team", {room: roomId, team: team})
    }
    
    async function switchSpyMaster(team) {
        socket.emit("switch-spymaster", {room: roomId, is_spymaster: !isSpyMaster})
    }
    
    const redLeft = Object.keys(cards).filter(cardId => cards[cardId].team === "RED" && !cards[cardId].selected).length
    const blueLeft = Object.keys(cards).filter(cardId => cards[cardId].team === "BLUE" && !cards[cardId].selected).length
    const neutralLeft = Object.keys(cards).filter(cardId => cards[cardId].team === "NEUTRAL" && !cards[cardId].selected).length

    return (
        <Container team={team}>
            <Board>
                <TitleBar>
                    <h4>{name}</h4>
                    <h4>Room Code: {roomId}</h4>
                </TitleBar>
                <Row>
                    <Link to="/">
                        <Button>Home</Button>
                    </Link>
                    <Button onClick={switchSpyMaster} disabled={gameComplete}>
                        {isSpyMaster ? "Become Normal" : "Become SpyMaster"}
                    </Button>
                    <Button onClick={endGame} disabled={gameComplete}>End Game</Button>
                    <Button onClick={newGame}>New Game</Button>
                </Row>
                {cardGrid.map((row, rowId) => (
                    <Row key={rowId}>
                        {row.map(cardId => {
                            const card = cards[cardId]
                            return (
                                <Card
                                    key={cardId}
                                    team={card.team}
                                    revealed={isSpyMaster || gameComplete}
                                    selected={card.selected}
                                    disabled={isSpyMaster || card.selected || gameComplete}
                                    onClick={() => selectCard(cardId)}
                                >
                                    {(!card.selected || gameComplete) && card.word}
                                </Card>
                            )
                        })}
                    </Row>
                ))}
                <Row>
                    <h3 style={{marginTop: "12px"}}>Cards Left</h3>
                </Row>
                <Row>
                    <Card
                        onClick={() => switchTeam("RED")}
                        revealed={true}
                        team={"RED"}
                    >
                        <div>{redLeft}</div>
                    </Card>
                    <Card
                        onClick={() => switchTeam("NEUTRAL")}
                        revealed={true}
                        team={"NEUTRAL"}
                    >
                        <div>{neutralLeft}</div>
                    </Card>
                    <Card
                        onClick={() => switchTeam("BLUE")}
                        revealed={true}
                        team={"BLUE"}
                    >
                        <div>{blueLeft}</div>
                    </Card>
                </Row>
            </Board>
            <RightPanel>
                <Log>
                    <h2 style={{textAlign: "center"}}>Message Log</h2>
                    {messages.map((msg, i) => (
                        <LogItem key={i}>{msg}</LogItem>
                    ))}
                </Log>
                <h2 style={{textAlign: "center"}}>Teams</h2>
                <TeamLists>
                    <TeamList>
                        { players.filter(player => player.current_team === "RED").map((player, i) => (
                            <TeamMember
                                key={i}
                                team="RED"
                                isSpyMaster={player.is_spymaster}
                            >
                                {player.name}
                            </TeamMember>
                        ))}
                    </TeamList>
                    <TeamList>
                        { players.filter(player => player.current_team === "BLUE").map((player, i) => (
                            <TeamMember
                                key={i}
                                team="BLUE"
                                isSpyMaster={player.is_spymaster}
                            >
                                {player.name}
                            </TeamMember>
                        ))}
                    </TeamList>
                </TeamLists>
                { players.filter(player => player.current_team === "NEUTRAL").map((player, i) => (
                    <TeamMember
                        key={i}
                        team="NEUTRAL"
                        isSpyMaster={player.is_spymaster}
                    >
                        {player.name}
                    </TeamMember>
                ))}
            </RightPanel>
        </Container>
    )
}

export default Room
