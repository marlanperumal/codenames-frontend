import React, { useRef, useState, useEffect } from "react"
import { useHistory } from "react-router-dom"
import styled from "styled-components"
import axios from "axios"
import "./styles/home.scss"

const Input = styled.input`
    text-transform: uppercase;
`

const Field = styled.div`
    margin-bottom: 1rem;
`

export default function Home({ setName, name }) {
    const [message, setMessage] = useState()
    const roomIdInput = useRef(null)
    const nameInput = useRef(null)
    const history = useHistory()

    useEffect(() => {
        if (name !== "PLAYER" && name.length > 0) {
            nameInput.current.value = name
            roomIdInput.current.focus()
        } else {
            nameInput.current.focus()
        }
    }, [name])

    async function onSubmit(e) {
        e.preventDefault()
        const name = nameInput.current.value.toUpperCase()
        const roomId = roomIdInput.current.value.toUpperCase()
        if (name.length > 0) {
            setName(name)
            const request = {}
            if (roomId.length > 0) {
                request.method = "get"
                request.url = `/api/rooms/${roomId}`
            } else {
                request.method = "post"
                request.url = `/api/rooms`
            }
            try {
                const { data } = await axios(request)
                history.push(data.id)
            } catch (error) {
                setMessage(error.response.data.message)
            }
        } else {
            setMessage("You must enter a Name")
        }
    }

    return (
        <div id="home">
            <h1>Codenames</h1>
            <div id="login" className="form">
                <form name="start-form" onSubmit={onSubmit} id="start-form">
                    <Field>
                        <label htmlFor="name">Name</label>
                        <Input
                            type="text"
                            ref={nameInput}
                            id="name"
                            name="name"
                            maxLength="20"
                        />
                    </Field>
                    <Field>
                        <label htmlFor="roomId">Room Code</label>
                        <Input
                            type="text"
                            ref={roomIdInput}
                            id="roomId"
                            name="roomId"
                            maxLength="6"
                        />
                        <div className="small">
                            Leave this empty to start a new room
                        </div>
                    </Field>
                    {message && <div className="error">{message}</div>}
                    <button type="submit" className="button" form="start-form">
                        Enter
                    </button>
                </form>
            </div>
        </div>
    )
}
