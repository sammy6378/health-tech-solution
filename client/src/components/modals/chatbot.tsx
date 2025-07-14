import { useState, useEffect, useRef, type SetStateAction } from 'react'
import '../../styles.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I help you today?', sender: 'bot' },
  ])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const handleInputChange = (e: { target: { value: SetStateAction<string> } }) => {
    setInputValue(e.target.value)
  }

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return

    // Add user message
    const newUserMessage = { text: inputValue, sender: 'user' }
    setMessages([...messages, newUserMessage])
    setInputValue('')

  try {
    // Call your NestJS API
    const response = await fetch('http://localhost:8000/chatbot/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: inputValue }),
    });
       const data = await response.json();
    const newBotMessage = { text: data.response, sender: 'bot' };
    setMessages(prev => [...prev, newBotMessage]);
  } catch (error) {
    const newBotMessage = { text: "Sorry, I'm having trouble connecting.", sender: 'bot' };
    setMessages(prev => [...prev, newBotMessage]);
  }
};

  const handleKeyPress = (e: { key: string }) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isOpen ? 'w-80 md:w-96' : 'w-16'}`}
    >
      {isOpen ? (
        <div
          className={`rounded-lg shadow-xl overflow-hidden flex flex-col dark:bg-gray-800 dark:text-white bg-white text-gray-800`}
          style={{ height: '500px' }}
        >
          {/* Header */}
          <div
            className={`flex justify-between items-center p-4 dark:bg-blue-300 bg-blue-600 text-white'}`}
          >
            <h3 className="font-semibold text-lg">Chat Support</h3>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto sidebar-scroll p-4 space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                    message.sender === 'user'
                        ? 'dark:bg-blue-600 dark:text-white'
                        : 'bg-gray-700 text-white'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className={`p-4 border-t dark:border-gray-700 dark:bg-gray-800 border-gray-200 bg-white`}
          >
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className={`flex-1 rounded-full px-4 py-2 focus:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 bg-gray-100 text-gray-800 placeholder-gray-500`}
              />
              <button
                onClick={handleSendMessage}
                className={`rounded-full w-10 h-10 flex items-center justify-center dark:bg-blue-600 dark:hover:bg-blue-700 bg-blue-500 hover:bg-blue-600 text-white`}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={toggleChat}
          className={`rounded-full cursor-pointer w-16 h-16 flex items-center justify-center shadow-lg dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white bg-white hover:bg-gray-100 text-blue-600`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

export default Chatbot
