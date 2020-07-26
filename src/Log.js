import React, { useState, useEffect } from "react"
import styled from "styled-components"
import socket from "./socket"

const StyledLog = styled.div`
    flex: 1 1 auto;
`

const LogItem = styled.div`
    min-height: 20px;
    font-size: 14px;
`

function Log() {
    const [messages, setMessages] = useState([])

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

    return (
        <StyledLog>
            <h2>Log</h2>
            {messages.map((msg, i) => (
                <LogItem key={i}>{msg}</LogItem>
            ))}
        </StyledLog>
    )
}

export default Log
