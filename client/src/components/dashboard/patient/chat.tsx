import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '@/store/store'
import { useUserData } from '@/hooks/useDashboard'
import {
  MessageCircle,
  Send,
  Search,
  User,
  Phone,
  Video,
  Info,
  MoreHorizontal,
  Paperclip,
  Mic,
  Smile,
} from 'lucide-react'

type Message = {
  senderId: string
  senderName?: string
  receiverId: string
  message: string
  timestamp: string
}

const Chat = () => {
  const { user } = useAuthStore()
  const { myPatients, myDoctors } = useUserData()
  const currentUserId = user.userId || 'defaultUserId'

  const contacts = (user.role === 'doctor' ? myPatients : myDoctors) || []

 const socketRef = useRef<ReturnType<typeof io> | null>(null)

 useEffect(() => {
   const socket = io('http://localhost:8000', {
     query: { userId: currentUserId },
   })
   socketRef.current = socket

   socket.on('chat:message', (data) => {
     setMessages((prev) => [...prev, data])
   })

   socket.on('notification:new', (notification) => {
     console.log('New notification:', notification)
   })

   return () => {
     socket.disconnect()
     socket.off('chat:message')
     socket.off('notification:new')
   }
 }, [currentUserId])


  const [messages, setMessages] = useState<Message[]>([])
  const [selectedContact, setSelectedContact] = useState<{
    id: string
    name: string
  } | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Filter messages for the selected contact
  const visibleMessages = messages.filter(
    (msg) =>
      (msg.senderId === user.userId &&
        msg.receiverId === selectedContact?.id) ||
      (msg.senderId === selectedContact?.id && msg.receiverId === user.userId),
  )

  console.log('Visible messages:', visibleMessages)

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom()
  }, [messages])

//   Send message function
 const sendMessage = (e: { preventDefault: () => void }) => {
   e.preventDefault()
   if (!selectedContact || newMessage.trim() === '') return

   const messageData = {
     senderId: currentUserId,
     senderName: selectedContact.name,
     receiverId: selectedContact.id,
     message: newMessage,
     timestamp: new Date().toISOString(),
   }

   socketRef.current?.emit('chat:message', messageData)
   setMessages((prev) => [...prev, messageData])
   setNewMessage('')
 }


  return (
    <div className="flex w-full h-[80vh] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
      {/* Sidebar Contacts */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Contacts Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <MessageCircle className="text-blue-500" size={20} />
              Messages
            </h2>
            {/* <div className="flex items-center gap-3">
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Phone size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Video size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div> */}
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {contacts?.map((contact) => (
            <div
              key={contact.user_id}
              onClick={() =>
                setSelectedContact({
                  id: contact.user_id!,
                  name: contact.first_name + ' ' + contact.last_name,
                })
              }
              className={`flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-blue-50 dark:hover:bg-gray-800 ${
                selectedContact?.id === contact.user_id
                  ? 'bg-blue-50 dark:bg-gray-800 border-l-4 border-blue-500'
                  : ''
              }`}
            >
              <div className="relative">
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 w-10 h-10 rounded-full flex items-center justify-center">
                  <User size={18} />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-800 dark:text-white truncate">
                    {contact.first_name} {contact.last_name}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    10:30 AM
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  Hi there! How can I help you today?
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="w-2/3 flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
          {selectedContact ? (
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 w-10 h-10 rounded-full flex items-center justify-center">
                  <User size={18} />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              <div>
                <h2 className="font-semibold text-gray-800 dark:text-white">
                  {selectedContact.name}
                </h2>
                <p className="text-sm text-green-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Online
                </p>
              </div>
            </div>
          ) : (
            <h2 className="font-semibold text-gray-800 dark:text-white">
              Select a contact to chat
            </h2>
          )}

          {selectedContact && (
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Phone size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Video size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Info size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <MoreHorizontal
                  size={20}
                  className="text-gray-600 dark:text-gray-400"
                />
              </button>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {selectedContact ? (
            visibleMessages.length > 0 ? (
              visibleMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.senderId === currentUserId
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-md p-4 rounded-2xl ${
                      msg.senderId === currentUserId
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className="font-medium mb-1">
                          {msg.senderId === currentUserId
                            ? 'You'
                            : msg.senderName || selectedContact.name}
                        </p>
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      <span className="text-xs opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300 p-4 rounded-full mb-4">
                  <MessageCircle size={48} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  Start a conversation
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  You haven't sent any messages to {selectedContact.name} yet.
                  Send your first message to start your conversation.
                </p>
              </div>
            )
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300 p-4 rounded-full mb-4">
                <MessageCircle size={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                Welcome to MediConnect Chat
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Select a contact from the list to start a conversation. You can
                message patients, schedule appointments, or discuss medical
                cases.
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {selectedContact && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <form onSubmit={sendMessage}>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
                >
                  <Paperclip size={20} />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
                >
                  <Smile size={20} />
                </button>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full pl-4 pr-12 py-3 rounded-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
                  >
                    <Mic size={20} />
                  </button>
                </div>

                <button
                  type="submit"
                  className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center justify-center"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat
