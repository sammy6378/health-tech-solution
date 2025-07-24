import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, Send, User, Bot, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatSession {
  userId?: string
  userName?: string
  sessionId: string
  startTime: Date
}

const ChatInterface = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState(
    localStorage.getItem('openrouter_api_key') || '',
  )
  const [systemInstructions, setSystemInstructions] = useState(
    localStorage.getItem('system_instructions') ||
      'You are a helpful medical assistant for Mediconnect. Provide informative, empathetic responses while always reminding users to consult healthcare professionals for serious concerns. Never provide specific diagnoses or treatment recommendations.',
  )
  const [session] = useState<ChatSession>({
    sessionId: `session_${Date.now()}`,
    startTime: new Date(),
    userName: 'Patient',
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    localStorage.setItem('openrouter_api_key', apiKey)
  }, [apiKey])

  useEffect(() => {
    localStorage.setItem('system_instructions', systemInstructions)
  }, [systemInstructions])

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    if (!apiKey) {
      toast({
        title: 'API Key Required',
        description: 'Please configure your OpenRouter API key in settings.',
        variant: 'destructive',
      })
      return
    }

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const chatMessages = [
        {
          role: 'system',
          content: `${systemInstructions}\n\nSession Info: Patient ${session.userName}, Session ID: ${session.sessionId}, Started: ${session.startTime.toLocaleString()}`,
        },
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user',
          content: input,
        },
      ]

      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Mediconnect',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'deepseek/deepseek-r1-0528:free',
            messages: chatMessages,
            temperature: 0.4,
            max_tokens: 700,
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.choices && data.choices[0]?.message?.content) {
        const assistantMessage: Message = {
          id: `msg_${Date.now()}_assistant`,
          role: 'assistant',
          content: data.choices[0].message.content,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Chat error:', error)
      toast({
        title: 'Error',
        description:
          'Failed to get response. Please check your API key and try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    toast({
      title: 'Chat Cleared',
      description: 'All messages have been removed.',
    })
  }

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed cursor-pointer bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl h-[500px] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Mediconnect Assistant
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
            <TabsList className="mx-6 mt-2 flex-shrink-0">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col min-h-0">
              {/* Messages Area with proper scrolling */}
              <div className="flex-1 overflow-hidden px-6">
                <ScrollArea className="h-full">
                  <div className="space-y-4 py-4 pr-4">
                    {messages.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Hello! I'm your Mediconnect assistant.</p>
                        <p className="text-sm mt-2">
                          How can I help you today?
                        </p>
                      </div>
                    )}

                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.role === 'user'
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}

                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>

                        {message.role === 'user' && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="bg-muted rounded-lg px-4 py-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Thinking...
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Invisible div to scroll to */}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* Input Area */}
              <div className="border-t p-4 flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    size="icon"
                    className="cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="settings"
              className="flex-1 p-6 space-y-6 overflow-auto"
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="api-key">OpenRouter API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your OpenRouter API key"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your API key is stored locally in your browser.
                  </p>
                </div>

                <div>
                  <Label htmlFor="system-instructions">
                    System Instructions
                  </Label>
                  <Textarea
                    id="system-instructions"
                    value={systemInstructions}
                    onChange={(e) => setSystemInstructions(e.target.value)}
                    placeholder="Define how the assistant should behave..."
                    className="mt-2 min-h-[120px]"
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex gap-2">
                    <Button
                      onClick={clearChat}
                      variant="outline"
                      className="flex-1 cursor-pointer"
                    >
                      Clear Chat
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ChatInterface
