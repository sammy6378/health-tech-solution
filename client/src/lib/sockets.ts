import { io } from 'socket.io-client'
import { useAuthStore } from '@/store/store'


const { user} = useAuthStore()
const currentUserId = user.userId || 'defaultUserId' // Fallback if user is not logged in

const socket = io('http://localhost:8000', {
  query: { userId: currentUserId }, // Pass userId to join private room
})

// Listen for chat messages
socket.on('chat:message', (data) => {
  console.log('New chat message:', data)
})

// Listen for notifications
socket.on('notification:new', (notification) => {
  console.log('New notification:', notification)
})
