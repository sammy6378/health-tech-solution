
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  MessageCircle,
  Send,
  User,
  Bot,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useKnowledgeBase } from './knowledgebase'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ReactMarkdown from 'react-markdown'
import rehypeExternalLinks from 'rehype-external-links'
import remarkGfm from 'remark-gfm'
import { baseUrl } from '@/lib/baseUrl'
import { getAuthHeaders } from '@/services/api-call'
import { useDashboardAiQueryService } from './agent/select-services'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  kbContent?: string
}

const ChatInterface = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { search, isLoaded, error } = useKnowledgeBase()
  const { handleQuery } = useDashboardAiQueryService()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    setIsLoading(true)

    try {
      // Get dashboard data and KB content
      const kbContent = search(input)

      // Create user message object
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: input,
        timestamp: new Date(),
        kbContent,
      }

      // Add user message to UI immediately
      setMessages((prev) => [...prev, userMessage])

      const currentInput = input
      setInput('')

       const isGreeting = isSimpleGreeting(currentInput)
      // Prepare messages for backend (clean format without kbContent)
      let dashboardSummary = ''
      let dashboardData = null
      let dashboardKbContent = ''

      if (!isGreeting) {
        const dashboardResult = handleQuery(currentInput)
        dashboardSummary = dashboardResult.summary
        dashboardData = dashboardResult.data
        dashboardKbContent = search(currentInput)
      }

      // Prepare messages for backend
      const chatMessages = [
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user',
          content: currentInput, // Keep original message for greetings
        },
      ]

      // Prepare enriched content with both dashboard data and KB content
      let enrichedContent = currentInput

      if (dashboardSummary) {
        enrichedContent = `Dashboard Data: ${dashboardSummary}\n\n`
      }

      if (dashboardKbContent) {
        enrichedContent += `Knowledge Base: ${dashboardKbContent}\n\n`
      }

      enrichedContent += `User Question: ${currentInput}`

      // Send enriched message to backend
      const response = await fetch(`${baseUrl}/chatapp/chat-with-context`, {
        method: 'POST',
        headers: getAuthHeaders(),
       body: JSON.stringify({
        messages: chatMessages,
        contextData: !isGreeting && dashboardSummary ? { summary: dashboardSummary, data: dashboardData, kbContent: dashboardKbContent } : undefined,
      }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      if (reader) {
        // Create assistant message placeholder
        const assistantMessage: Message = {
          id: `msg_${Date.now()}_assistant`,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          assistantContent += chunk

          // Update the assistant message with accumulated content
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: assistantContent }
                : msg,
            ),
          )
        }
      } else {
        throw new Error('No response body received')
      }

      if (!assistantContent.trim()) {
        throw new Error('Empty response received')
      }
    } catch (error) {
      console.error('Chat error:', error)
      toast({
        title: 'Error',
        description: 'Failed to get response from assistant. Please try again.',
        variant: 'destructive',
      })

      // Remove any placeholder message if there was an error
      setMessages((prev) => prev.filter((msg) => msg.content.trim() !== ''))
    } finally {
      setIsLoading(false)
    }
  }

  const isSimpleGreeting = (message: string): boolean => {
    const lowerMessage = message.toLowerCase().trim()

    const greetingPatterns = [
      /^(hi|hello|hey|good morning|good afternoon|good evening|good day)$/,
      /^(hi|hello|hey)\s*[!.]*$/,
      /^good\s+(morning|afternoon|evening|day)\s*[!.]*$/,
      /^how\s+(are\s+you|is\s+everything)[\s?!.]*$/,
      /^(thank\s+you|thanks|bye|goodbye|see\s+you)[\s!.]*$/,
      /^what\s+can\s+you\s+do[\s?!.]*$/,
      /^who\s+are\s+you[\s?!.]*$/,
      /^help[\s!.]*$/,
    ]

    return greetingPatterns.some((pattern) => pattern.test(lowerMessage))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
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
        <DialogContent className="sm:max-w-2xl h-[500px] flex flex-col p-0 bg-white dark:bg-gray-900 dark:text-white">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              MediConnect Assistant
              {!isLoaded && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {error && <AlertCircle className="h-4 w-4 text-destructive" />}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
            <TabsContent value="chat" className="flex-1 flex flex-col min-h-0">
              {/* Knowledge Base Status */}
              {error && (
                <Alert className="mx-6 mt-2" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Knowledge base error: {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Messages Area with proper scrolling */}
              <div className="flex-1 overflow-hidden px-6">
                <ScrollArea className="h-full">
                  <div className="space-y-4 py-4 pr-4">
                    {messages.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Hello! I'm your Mediconnect assistant</p>
                        <p className="text-sm mt-2">
                          How can I help you today?
                        </p>
                        {!isLoaded && (
                          <p className="text-xs mt-2 flex items-center justify-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Loading knowledge base...
                          </p>
                        )}
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
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                          </div>
                        )}

                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 shadow-sm ${
                            message.role === 'user'
                              ? 'bg-blue-500 text-white dark:bg-blue-600'
                              : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[
                                [
                                  rehypeExternalLinks,
                                  {
                                    target: '_blank',
                                    rel: ['noopener', 'noreferrer'],
                                  },
                                ],
                              ]}
                              components={{
                                a: ({ node, ...props }) => (
                                  <a
                                    {...props}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline text-blue-200 hover:text-blue-100"
                                  >
                                    {props.children}
                                  </a>
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </p>
                          <p className="text-xs mt-1 opacity-70 px-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>

                        {message.role === 'user' && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-300 dark:bg-blue-700 flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
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
                            <span className="flex items-center h-5">
                              <span className="dot bg-muted-foreground rounded-full w-2 h-2 mx-0.5 animate-bounce" style={{ animationDelay: '0s' }} />
                              <span className="dot bg-muted-foreground rounded-full w-2 h-2 mx-0.5 animate-bounce" style={{ animationDelay: '0.2s' }} />
                              <span className="dot bg-muted-foreground rounded-full w-2 h-2 mx-0.5 animate-bounce" style={{ animationDelay: '0.4s' }} />
                            </span>
                          </div>
                          <style>
                            {`
                              .animate-bounce {
                                display: inline-block;
                                animation: bounce 1s infinite;
                              }
                              @keyframes bounce {
                                0%, 80%, 100% { transform: translateY(0); }
                                40% { transform: translateY(-8px); }
                              }
                            `}
                          </style>
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
                    className="flex-1 bg-white text-black dark:bg-gray-900 dark:text-white border border-gray-300 dark:border-gray-700"
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
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ChatInterface