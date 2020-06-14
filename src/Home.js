import React, { useRef, useState, useEffect } from "react"
import { useHistory } from "react-router-dom"
import styled from "styled-components"
import axios from "axios"


const Container = styled.div`
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    background-color: #b4b4b4;
    height: 100%;
`

const Form = styled.form`
    margin-bottom: 20px;
`

const Input = styled.input`
    text-transform: uppercase;
`

const ErrorMessage = styled.div`
    height: 40px;
    color: red;
`

export default function Home({setName, name}) {
    const [message, setMessage] = useState()
    const roomIdInput = useRef(null)
    const nameInput = useRef(null)
    const history = useHistory()
    const defaultName = name === "PLAYER" ? "" : name

    useEffect(() => {
        if (name !== "PLAYER" && name.length > 0) {
            nameInput.current.value = name
            roomIdInput.current.focus()
        }
        else {
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
            }
            else {
                request.method = "post"
                request.url = `/api/rooms`
            }
            try {
                const { data } = await axios(request)
                history.push(data.id)
            }
            catch (error) {
                setMessage(error.response.data.message)
            }
        } 
        else {
            setMessage("You must enter a Name")
        }
    }

    return (
        <Container>
            <h1>
                Codenames
            </h1>
            <Form name="start-form" onSubmit={onSubmit} id="start-form">
                <label htmlFor="name" maxLength="20">
                    Name&nbsp;
                </label>
                <br/>
                <Input type="text" ref={nameInput} id="name" name="name" defaultValue={defaultName}/>
                <br/>
                <label htmlFor="roomId" maxLength="6">
                    Room Code
                </label>
                <br/>
                <Input type="text" ref={roomIdInput} id="roomId" name="roomId"/>
                <br/>
            </Form>
            <button type="submit" form="start-form">Enter</button>
            <div> Leave room code empty to start a new room</div>
            <ErrorMessage>{message}</ErrorMessage>
        </Container>
    )
}