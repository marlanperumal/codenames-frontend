import React, { useRef } from "react"
import { useHistory } from "react-router-dom"
import styled from "styled-components"


const Container = styled.div`
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    background-color: #b4b4b4;
    height: 100%;
`

const Form = styled.form`
    margin-top: 20px;
`

export default function Home() {
    const gameIdInput = useRef(null)
    const history = useHistory()

    function onSubmit(e) {
        e.preventDefault()
        history.push(`/${gameIdInput.current.value}`)
    }

    return (
        <Container>
            <h1>
                Codenames
            </h1>
            <Form onSubmit={onSubmit}>
                <label htmlFor="gameId">
                    Enter Game Id&nbsp;
                </label>
                <input type="text" ref={gameIdInput} id="gameId" name="gameId"/>
                <button type="submit">Go</button>
            </Form>
        </Container>
    )
}