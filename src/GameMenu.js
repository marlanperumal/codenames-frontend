import React from "react"
import socket from "./socket"
import ButtonWithConfirmation from "./ButtonWithConfirmation"

const confirmBecomeSpyMaster =
    "Are you sure you want to become the spy master? This will reveal all the cards to you."
const confirmBecomeNormal = "Are you sure you want to become a normal player?"
const confirmEndGame =
    "Are you sure you want to end the game and reveal all cards?"
const confirmNewGame = "Are you sure you want to start a new game?"
const confirmNavigateHome =
    "Are you sure you wish to navigate to the home page?"

function GameMenu({ gameComplete, isSpyMaster }) {
    async function newGame() {
        socket.emit("new-game")
    }

    async function endGame() {
        socket.emit("end-game")
    }

    async function toggleSpyMaster() {
        socket.emit("toggle-spymaster", {
            is_spymaster: !isSpyMaster,
        })
    }

    return (
        <>
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
                onClick={toggleSpyMaster}
                disabled={gameComplete}
                confirmText={
                    isSpyMaster ? confirmBecomeNormal : confirmBecomeSpyMaster
                }
            >
                {isSpyMaster ? "Become Normal" : "Become Spy Master"}
            </ButtonWithConfirmation>
        </>
    )
}

export default GameMenu
