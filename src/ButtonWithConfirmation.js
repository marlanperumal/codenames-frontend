import React, { useCallback, useEffect, useState } from "react"
import styled from "styled-components"

const ModalOverlay = styled.div`
    z-index: 1000;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0.5, 0.5, 0.5, 0.8); 
`

const Modal = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #CCC;
    box-shadow: 2px 2px 20px #333;
    border-radius: 1em;
    width: 450px;
    max-width: 100%;
    z-index: 1100;
`

const Title = styled.div`
    padding: 1em 2em 0.5em;
    font-weight: bold;
`

const Text = styled.div`
    padding: 1em 2em;
`

const Buttons = styled.div`
    padding: 1em 2em 2em;
    display: flex;
    justify-content: space-between;
`

const ModalButton = styled.button`
    padding: 0.5em 1em;
    min-width: 6em;
`

const PrimaryButton = styled.button`
    margin: 4px;
    font-family: inherit;
    width: 120px;
    height: 90px;
    background-color: white;
`

function ButtonWithConfirmation({ onClick, confirmText, children }) {
    const [showModal, setShowModal] = useState(false)

    const handleClick = useCallback(() => {
        if (confirmText) {
            setShowModal(true)
        } else if (onClick) {
            onClick()
        }
    }, [confirmText, setShowModal, onClick])

    const handleYes = () => {
        setShowModal(false)
        onClick()
    }

    return (
        <>
            <PrimaryButton onClick={handleClick}>{children}</PrimaryButton>
            {showModal && (
                <>
                    <ModalOverlay onClick={() => setShowModal(false)}/>
                    <Modal>
                        <Title>Are you sure?</Title>
                        <hr/>
                        <Text>{confirmText}</Text>
                        <Buttons>
                            <ModalButton onClick={handleYes}>Yes</ModalButton>
                            <ModalButton onClick={() => setShowModal(false)}>No</ModalButton>
                        </Buttons>
                    </Modal>
                </>
            )}
        </>
    )
}

export default ButtonWithConfirmation
