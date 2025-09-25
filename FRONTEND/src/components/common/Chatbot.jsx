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

    // Generamos un ID de sesión único la primera vez que se carga el componente
    useEffect(() => {
        let currentSessionId = localStorage.getItem('chatSessionId');
        if (!currentSessionId) {
            currentSessionId = uuidv4();
            localStorage.setItem('chatSessionId', currentSessionId);
        }
        setSessionId(currentSessionId);
    }, []);
    
    // Para que el chat siempre scrollee hacia el último mensaje
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen && messages.length === 0) {
            // Mensaje de bienvenida la primera vez que se abre
            setMessages([{ sender: 'bot', text: '¡Hola! Soy Jarvis. ¿En qué te puedo ayudar hoy?' }]);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const userMessage = inputValue.trim();
        if (!userMessage || isLoading) return;

        // Agregamos el mensaje del usuario al chat
        setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Llamamos a la API del backend
            const response = await postChatQuery({
                sesion_id: sessionId,
                pregunta: userMessage,
            });
            // Agregamos la respuesta del bot
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
                    <h3>VOID ASSISTANT</h3>
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
                        placeholder="Escribí tu consulta..."
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !inputValue.trim()}>
                        <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                    </button>
                </form>
            </div>
            <button onClick={toggleChat} className="chatbot-toggle-button">
                {isOpen ? (
                    // Ícono de cerrar (X)
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                ) : (
                    // Usamos una etiqueta <img> para tu logo
                    <img src="/CHATBOT.png" alt="Abrir Chat" className="chatbot-logo-img" />
                )}
            </button>
        </div>
    );
};

export default Chatbot;