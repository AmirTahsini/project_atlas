import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Input, Button, Space, ConfigProvider, Modal } from 'antd';
import { SendOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/client'
import { SEND_USER_INPUT } from '../../utils/mutations'
import ResponseEl from '../ResponseEl'
import './style.css'

const GameEl = ({setActiveTimer, activeTimer, showReplay, setShowReplay, showInstructions, setShowInstructions}) => {
    const [formState, setFormState] = useState({input: ''});
    const [message, setMessage] = useState([])
    const [remainingTime, setRemainingTime] = useState(301);
    const [showText , setShowText] = useState(true);
    const [disabledEl, setDisabledEl] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showInvalidSubmission, setShowInvalidSubmission] = useState(false);
    const [showInvalidWord, setShowInvalidWord] = useState(false);
    const [showInvalidPlay, setShowInvalidPlay] = useState(false);
    const [showInvalidRepeat, setShowInvalidRepeat] = useState(false);
    const [showRepeatedResponse, setShowRepeatedResponse] = useState('')
    const [showWin, setShowWin] = useState(false);

    const [sendUserInput, {error}] = useMutation(SEND_USER_INPUT);

    useEffect(() => {
        let timer;
        if (activeTimer) {
            timer = setInterval(()=>{
                setRemainingTime(prevTime => prevTime-1);
            }, 1000);
        }

        if (remainingTime===0) {
            clearInterval(timer);
            setDisabledEl(true);
            setShowReplay(true);
            setShowModal(true);
        }

        return () => clearInterval(timer)
    }, [activeTimer, remainingTime])

    const formatTimer = time => {
        const minutes = Math.floor(time/60);
        const seconds = time % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    const handleInvalidWord = () => {
        setShowInvalidWord(false);
    }
    const handleInvalidPlay = () => {
        setShowInvalidPlay(false);
    }
    const handleInvalidSubmission = () => {
        setShowInvalidSubmission(false);
    }
    const handleInvalidRepeat = () => {
        setShowInvalidRepeat(false);
    }
    const handleCloseWinModal = () => {
        setShowWin(false);
    }
    const handleChange = (event) => {
        const {name, value} = event.target; 

        setFormState({
            ...formState,
            [name]: value,
        })
    }

    const handleFormSubmit = async () => {
        if (!formState.input) {
            return;
        }
        const userInput = formState.input.trimEnd();
        const userInputArr= userInput.split('')
        const userLast = userInputArr[userInputArr.length-1];

        if (userLast === '.') {
            setShowInvalidSubmission(true)
            return;
        }

        try {
            //Future Development: Add dictionary API
            // const isValidWord = checkIsWord(userInput);

            // if (!isValidWord) {
            //     setShowInvalidWord(true);
            //     return;
            // }

            const {data} = await sendUserInput({
                variables: {input: userInput},
            });
            if (data) {

                const newMessage = {
                    id: message.length + 1,
                    content: userInput,
                    sender: 'user',
                }
    
                const aiContent = data.sendUserInput.message.slice(0, -1).toLowerCase()
    
                const newAiMessage = {
                    id: message.length+2,
                    content: aiContent,
                    sender: 'ai',
                }
                
                if (message.length) {
                    const userFirstLetter = userInput.split('')[0]
                    const aiResArr = [...message, newMessage, newAiMessage]
                    const aiArr = aiResArr[aiResArr.length-3].content.split('')
                    const aiLastLetter = aiArr[aiArr.length-1]
                    if (userFirstLetter !== aiLastLetter) {
                        setShowInvalidPlay(true);
                        return;
                    }
                    for (const msg of message) {
                        if (userInput === msg.content) {
                            setShowInvalidRepeat(true);
                            return;
                        }
                        if (aiContent === msg.content) {
                            setShowRepeatedResponse(aiContent);
                            setShowWin(true);
                            setActiveTimer(false);
                            return;
                        }
                    }     
                }
                setMessage([...message, newMessage, newAiMessage])
                setActiveTimer(true);
                setShowText(false);
                setFormState({input: ''})
            }
            
        } catch (err) {
            console.error(err)
        }
        
    }
    const handleReplayGame = () => {
        setMessage([]);
        setRemainingTime(301);
        setActiveTimer(false);
        setShowText(true);
        setShowReplay(false);
        setDisabledEl(false);
        setShowModal(false);
        setShowWin(false);
        setFormState({input: ''})
    }
    const handleHideModal = () => {
        setShowModal(false);
    }
    return (
        <div>
            <Row align="middle" justify="space-between">

                <Col sm={24} md={{span: 18, offset: 3}}>
                    <div className={showInstructions ? 'instructions' : 'hidden'}>
                        <h3 className="rules-title">Rules of the game</h3>
                        <ul>
                            <li><span className="list-item-main">Starting</span> - Submit a word in Spanish to begin the game</li>
                            <li><span className="list-item-main">Validity</span> - Each word must be a valid dictionary word</li>
                            <li><span className="list-item-main">Chaining</span> - The word played subsequently must start with the letter of the last word. For example, if the previous word is "casa", the next word must begin with an "a".</li>
                            <li><span className="list-item-main">No repeating words</span> - Players cannot use a word that has already been played in the current game.</li>
                            <li><span className="list-item-main">Time limit</span> - The game will last for 5 minutes and starts when you submit your first word. Please note that checking the definition of a word will not pause the timer.</li>
                            <li><span className="list-item-main">Winning</span> - Try to chain as many words as possible and have fun!</li>
                        </ul>
                    </div>
                </Col>
            </Row>
            <Row justify="center">
                <div className="">
                    <div className="timer-div">
                        <h4>Remaining Time: {
                                remainingTime <= 300 ? (
                                    <span className={remainingTime <= 5 ? 'red' : ''}>{formatTimer(remainingTime)}</span>
                                    ) : (
                                    <span>5:00</span>
                                )
                            }
                        </h4>
                        <div className={showReplay ? '' : 'hidden'}>
                            <ConfigProvider theme={{
                                token: {
                                    colorPrimary: '#3BC14A',
                                }
                            }}>
                                <Button type="primary" onClick={handleReplayGame}>Replay</Button>
                            </ConfigProvider>
                        </div>
                    </div>
                </div>
            </Row>
            <Row>
                <Col sm={24} lg={{span: 12, offset: 6}}>
                    <div className={showText ? 'game-card' : 'game-card game-card-bottom'}>
                        <p className={showText ? '' : 'hidden'}>Send a word to start your game!</p>
                        <div>
                            {message.map(({id, content, sender})=>{
                                return <ResponseEl key={id} content={content} sender={sender} game='game'/>
                            })}
                        </div>
                    </div>
                </Col>
            </Row>
            <div className="form-styles">
                <ConfigProvider theme={{
                    token: {
                        colorPrimary: '#3BC14A',
                    }
                }}>
                    <Form onFinish={handleFormSubmit} disabled={disabledEl}>
                        <Form.Item>
                            <Space.Compact className='form-input'>
                                <Input 
                                    type="text"
                                    name="input"
                                    value={formState.input}
                                    onChange={handleChange}
                                />
                                <Button htmlType='submit'><SendOutlined/></Button>
                            </Space.Compact>
                        </Form.Item>
                    </Form>
                </ConfigProvider>
            </div>
            <ConfigProvider theme={{
                token: {
                    colorPrimary: '#3BC14A'
                }
            }}>
                <Modal
                    title="Game Over!"
                    okText="Yes"
                    closable={false}
                    centered
                    cancelText="No"
                    open={showModal}
                    onOk={handleReplayGame}
                    onCancel={handleHideModal}
                >
                    Play again?
                </Modal>
            </ConfigProvider>
            <ConfigProvider theme={{
                token: {
                    colorPrimary: 'red'
                }
            }}>
                <Modal
                    title="Invalid Input!"
                    closable={false}
                    centered
                    open={showInvalidWord}
                    onOk={handleInvalidWord}
                    footer={[
                        <Button type="primary" onClick={handleInvalidWord}>
                            Ok
                        </Button>
                    ]}
                >
                     Each word must be a valid dictionary word.
                </Modal>
            </ConfigProvider>
            <ConfigProvider theme={{
                token: {
                    colorPrimary: 'red'
                }
            }}>
                <Modal
                    title="Invalid Chaining!"
                    closable={false}
                    centered
                    open={showInvalidPlay}
                    footer={[
                        <Button type="primary" onClick={handleInvalidPlay}>
                            Ok
                        </Button>
                    ]}
                >
                    The word played after the first turn must start with the letter of the last word. For example, if the previous word is "casa", the next word must begin with an "a".
                </Modal>
            </ConfigProvider>
            <ConfigProvider theme={{
                token: {
                    colorPrimary: 'red'
                }
            }}>
                <Modal
                    title="Invalid Submission!"
                    closable={false}
                    centered
                    open={showInvalidSubmission}
                    footer={[
                        <Button type="primary" onClick={handleInvalidSubmission}>
                            Ok
                        </Button>
                    ]}
                >
                    Submission must not end in a special character!
               </Modal>
            </ConfigProvider>
            <ConfigProvider theme={{
                token: {
                    colorPrimary: 'red'
                }
            }}>
                <Modal
                    title="Invalid Play!"
                    closable={false}
                    centered
                    open={showInvalidRepeat}
                    footer={[
                        <Button type="primary" onClick={handleInvalidRepeat}>
                            Ok
                        </Button>
                    ]}
                >
                    No repeating words. Players cannot use a word that has already been played in the current game.

               </Modal>
            </ConfigProvider>
            <ConfigProvider theme={{
                token: {
                    colorPrimary: '#41c745'
                }
            }}>
                <Modal
                    title="YOU WIN!"
                    centered
                    open={showWin}
                    okText="Play again"
                    onOk={handleReplayGame}
                    cancelText="No thanks"
                    onCancel={handleCloseWinModal}
                >
                    <p>LingoAI sent a repeated word ({showRepeatedResponse})</p>
                    <p>You win with {formatTimer(remainingTime)} remaining!</p>
                </Modal>
            </ConfigProvider>
        </div>
    )
}

export default GameEl;