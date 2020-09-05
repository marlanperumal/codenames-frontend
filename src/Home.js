import React, { useRef, useState, useEffect } from "react"
import { useHistory } from "react-router-dom"
import styled from "styled-components"
import axios from "axios"
import "./styles/home.scss"
import { flags } from "./config"

const Input = styled.input`
    text-transform: uppercase;
`

const Field = styled.div`
    margin-bottom: 1rem;
`

const SubmitRow = styled.div`
    display: flex;
    justify-content: space-between;
`

const LanguageSelector = styled.div`
    display: flex;
    justify-content: flex-end;
`

const Flag = styled.img`
    align-self: center;
    margin-right: 8px;
`

export default function Home({ name, setName, language, setLanguage }) {
    const [message, setMessage] = useState()
    const [languages, setLanguages] = useState([{ id: language }])
    const roomIdInput = useRef(null)
    const nameInput = useRef(null)
    const languageSelector = useRef(null)
    const history = useHistory()

    useEffect(() => {
        async function getLanguages() {
            const request = {
                method: "get",
                url: "/api/languages",
            }
            const { data } = await axios(request)
            setLanguages(data)
            languageSelector.current.value = language
        }
        getLanguages()
    }, [language])

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
                request.url = "/api/rooms"
                request.data = {
                    language_id: languageSelector.current.value,
                }
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

    const switchLanguage = () => {
        setLanguage(languageSelector.current.value)
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
                    <SubmitRow>
                        <button
                            type="submit"
                            className="button"
                            form="start-form"
                        >
                            Enter
                        </button>
                        <LanguageSelector>
                            <Flag src={flags[language]} alt={language} />
                            <select
                                ref={languageSelector}
                                onChange={switchLanguage}
                            >
                                {languages.map(lang => (
                                    <option value={lang.id}>{lang.id}</option>
                                ))}
                            </select>
                        </LanguageSelector>
                    </SubmitRow>
                </form>
            </div>
        </div>
    )
}
