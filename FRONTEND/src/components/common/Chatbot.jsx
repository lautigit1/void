// En FRONTEND/src/components/common/Chatbot.jsx
import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { postChatQuery } from '@/services/api';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        let currentSessionId = localStorage.getItem('chatSessionId');
        if (!currentSessionId) {
            currentSessionId = uuidv4();
            localStorage.setItem('chatSessionId', currentSessionId);
        }
        setSessionId(currentSessionId);
    }, []);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const toggleChat = () => {
        if (!isOpen && messages.length === 0) {
            setMessages([{ sender: 'bot', text: '¡Hola! Soy Kara, tu asistente virtual. ¿En que te puedo ayudar?' }]);
        }
        setIsOpen(!isOpen);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const userMessage = inputValue.trim();
        if (!userMessage || isLoading) return;

        setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await postChatQuery({
                sesion_id: sessionId,
                pregunta: userMessage,
            });
            setMessages(prev => [...prev, { sender: 'bot', text: response.respuesta }]);
        } catch (error) {
            console.error("Error al contactar al chatbot:", error);
            setMessages(prev => [...prev, { sender: 'bot', text: 'Disculpá, estoy teniendo problemas para conectarme.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-container">
            <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
                <div className="chatbot-header">
                    <h3>CHAT VOID</h3>
                    {/* Botón de cierre "X" dentro del header */}
                    <button onClick={toggleChat} className="chatbot-close-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div className="chatbot-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message-bubble ${msg.sender}`}>
                            {msg.text}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message-bubble bot typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="chatbot-input-form">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder=""
                        disabled={isLoading}
                    />
                    {/* Botón de texto "SEND" */}
                    <button type="submit" disabled={isLoading || !inputValue.trim()} className="chatbot-send-btn">
                        SEND
                    </button>
                </form>
            </div>
            
            {/* Botón flotante para abrir el chat */}
            <button onClick={toggleChat} className="chatbot-toggle-button">
                <img src="/CHATBOT.png" alt="Abrir Chat" className="chatbot-logo-img" />
            </button>
        </div>
    );
};

export default Chatbot;