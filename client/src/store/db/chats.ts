interface TMessage {
  id: string
  senderId: string
  senderName: string
  receiverId: string
  message: string
  timestamp: string
  conversationId: string // To group messages between two users
}

export class ChatDbService {
  private db: IDBDatabase | null = null
  private readonly dbName: string = 'MediConnectChatDB'
  private readonly storeName: string = 'ChatStore'

  constructor() {
    this.initDatabase()
  }

  public initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)

      // errors
      request.onerror = (event) => {
        console.error('Chat Database error:', event)
        reject(event)
      }

      // success
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        console.log('Chat Database opened successfully')
        resolve(this.db)
      }

      // create object store
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, {
            keyPath: 'id',
          })
          objectStore.createIndex('id', 'id', { unique: true })
          objectStore.createIndex('senderId', 'senderId', { unique: false })
          objectStore.createIndex('receiverId', 'receiverId', { unique: false })
          objectStore.createIndex('conversationId', 'conversationId', {
            unique: false,
          })
          objectStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  // Generate conversation ID for two users (consistent regardless of order)
  private generateConversationId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join('_')
  }

  // Add message
  async addMessage(message: Omit<TMessage, 'conversationId'>): Promise<void> {
    return new Promise((resolve, reject) => {
      const conversationId = this.generateConversationId(
        message.senderId,
        message.receiverId,
      )
      const messageWithConversation: TMessage = {
        ...message,
        conversationId,
      }

      const transaction = this.db!.transaction(this.storeName, 'readwrite')
      const objectStore = transaction.objectStore(this.storeName)
      const request = objectStore.add(messageWithConversation)

      request.onsuccess = () => {
        console.log('Message added successfully')
        resolve()
      }

      request.onerror = (event) => {
        console.error('Error adding message:', event)
        reject(event)
      }
    })
  }

  // Get all messages for a conversation between two users
  async getConversationMessages(
    userId1: string,
    userId2: string,
  ): Promise<TMessage[]> {
    return new Promise((resolve, reject) => {
      const conversationId = this.generateConversationId(userId1, userId2)
      const transaction = this.db!.transaction(this.storeName, 'readonly')
      const objectStore = transaction.objectStore(this.storeName)
      const index = objectStore.index('conversationId')
      const request = index.getAll(conversationId)

      request.onsuccess = (event) => {
        const messages = (event.target as IDBRequest).result
        // Sort by timestamp
        messages.sort(
          (a: TMessage, b: TMessage) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        )
        resolve(messages)
      }

      request.onerror = (event) => {
        console.error('Error getting conversation messages:', event)
        reject(event)
      }
    })
  }

  // Get all messages for a specific user (all conversations)
  async getAllUserMessages(userId: string): Promise<TMessage[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readonly')
      const objectStore = transaction.objectStore(this.storeName)
      const request = objectStore.getAll()

      request.onsuccess = (event) => {
        const allMessages = (event.target as IDBRequest).result
        const userMessages = allMessages.filter(
          (msg: TMessage) =>
            msg.senderId === userId || msg.receiverId === userId,
        )
        // Sort by timestamp
        userMessages.sort(
          (a: TMessage, b: TMessage) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        )
        resolve(userMessages)
      }

      request.onerror = (event) => {
        console.error('Error getting user messages:', event)
        reject(event)
      }
    })
  }

  // Delete a specific message
  async deleteMessage(messageId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readwrite')
      const objectStore = transaction.objectStore(this.storeName)
      const request = objectStore.delete(messageId)

      request.onsuccess = () => {
        console.log('Message deleted successfully')
        resolve()
      }

      request.onerror = (event) => {
        console.error('Error deleting message:', event)
        reject(event)
      }
    })
  }

  // Delete all messages in a conversation
  async deleteConversation(userId1: string, userId2: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const conversationId = this.generateConversationId(userId1, userId2)
      const transaction = this.db!.transaction(this.storeName, 'readwrite')
      const objectStore = transaction.objectStore(this.storeName)
      const index = objectStore.index('conversationId')
      const request = index.getAll(conversationId)

      request.onsuccess = (event) => {
        const messages = (event.target as IDBRequest).result
        const deleteTransaction = this.db!.transaction(
          this.storeName,
          'readwrite',
        )
        const deleteObjectStore = deleteTransaction.objectStore(this.storeName)

        messages.forEach((message: TMessage) => {
          deleteObjectStore.delete(message.id)
        })

        deleteTransaction.oncomplete = () => {
          console.log('Conversation deleted successfully')
          resolve()
        }

        deleteTransaction.onerror = (event) => {
          console.error('Error deleting conversation:', event)
          reject(event)
        }
      }

      request.onerror = (event) => {
        console.error('Error finding conversation messages:', event)
        reject(event)
      }
    })
  }

  // Delete all messages
  async deleteAllMessages(): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readwrite')
      const objectStore = transaction.objectStore(this.storeName)
      const request = objectStore.clear()

      request.onsuccess = () => {
        console.log('All messages deleted successfully')
        resolve()
      }

      request.onerror = (event) => {
        console.error('Error deleting all messages:', event)
        reject(event)
      }
    })
  }
}

// Export singleton instance
export const chatDbService = new ChatDbService()
