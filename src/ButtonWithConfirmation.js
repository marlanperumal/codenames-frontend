import React, { useCallback, useState } from "react"
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
    background: #000;
    border-radius: 0.5em;
    width: 400px;
    max-width: 100%;
    z-index: 1100;
    border: solid 1px #444;
    padding: 16px;
`

const Text = styled.div`
    margin-bottom: 16px;
`

const Buttons = styled.div`
    display: flex;
    justify-content: space-between;
`

const ModalButton = styled.button`
    padding: 0.5em 1em;
    min-width: 6em;
`

const PrimaryButton = styled.button`
    margin-bottom: 0.5rem;
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
            <PrimaryButton onClick={handleClick} className="button">
                {children}
            </PrimaryButton>
            {showModal && (
                <>
                    <ModalOverlay onClick={() => setShowModal(false)} />
                    <Modal>
                        <Text>{confirmText}</Text>
                        <Buttons>
                            <ModalButton className="button" onClick={handleYes}>
                                Yes
                            </ModalButton>
                            <ModalButton
                                className="button"
                                onClick={() => setShowModal(false)}
                            >
                                No
                            </ModalButton>
                        </Buttons>
                    </Modal>
                </>
            )}
        </>
    )
}

export default ButtonWithConfirmation
