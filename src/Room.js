import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import styled from "styled-components"
import socket from "./socket"
import GameMenu from "./GameMenu"
import GameBoard from "./GameBoard"
import Teams from "./Teams"
import Log from "./Log"
import "./styles/room.scss"

const Body = styled.div`
    display: flex;
    flex-direction: column;
`

const Container = styled.div`
    display: flex;
    flex-flow: row nowrap;
    flex-grow: 1;
    justify-content: space-between;
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

const MiddlePanel = styled.div`
    display: flex;
    flex-flow: column nowrap;
`

function Room({ name }) {
    const [gameId, setGameId] = useState(null)
    const [isSpyMaster, setIsSpyMaster] = useState(false)
    const [team, setTeam] = useState("NEUTRAL")
    const [gameComplete, setGameComplete] = useState(null)
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
        setIsSpyMaster(false)
    }, [gameId, team])

    return (
        <Body id="room" data-team={team}>
            <TitleBar>
                <h4>{name}</h4>
                <h4>Room Code: {roomId}</h4>
            </TitleBar>
            <Container team={team}>
                <LeftPanel>
                    <GameMenu
                        isSpyMaster={isSpyMaster}
                        gameComplete={gameComplete}
                    />
                </LeftPanel>
                <MiddlePanel>
                    <GameBoard
                        isSpyMaster={isSpyMaster}
                        gameComplete={gameComplete}
                        team={team}
                    />
                </MiddlePanel>
                <RightPanel>
                    <Teams />
                    <Log />
                </RightPanel>
            </Container>
        </Body>
    )
}

export default Room
