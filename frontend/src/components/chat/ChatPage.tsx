"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Send, Upload, Bot, User, FileText, Menu, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { ChatSession, Message, MessageType } from "@/interface/chat.interface"
import { useMutation, useQuery } from "@tanstack/react-query"
import { ChatWithAI, getMessagesBySession } from "@/services/chat.service"
import { formatAnswer } from "@/components/formatAnswer"
import ChatSidebar from "@/components/chat/ChatSidebar"
import { useParams } from "next/navigation"


export default function ChatPage() {

    const params = useParams<{ id?: string }>()
    const sessionId = params.id ? params.id : '';
    

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: MessageType.ASSISTANT,
      content:
        "Hello! I'm your AI assistant. Upload a PDF document and I'll help you analyze and answer questions about it.",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const {mutate: ChatWithAIMutation, isPending: isChatWithAIMutationPending} = useMutation({
    mutationFn: (question: string) => ChatWithAI(question),
    onSuccess: (data) => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: MessageType.ASSISTANT,
        content: data.data.answer,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    },
    onError: (error: any) => {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: MessageType.SYSTEM,
        content: `Error: ${error.message || "Something went wrong"}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    },
  })

  const {data: getMessage} = useQuery({
    queryKey: ["ChatMessage", sessionId],
    queryFn: () => getMessagesBySession(sessionId),
  })

  const handleSendMessage = () => {
    if (!inputValue.trim() || isChatWithAIMutationPending) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: MessageType.USER,
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    ChatWithAIMutation(inputValue)

    setInputValue("")
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Show uploading message
    const uploadingMessage: Message = {
      id: Date.now().toString(),
      type: MessageType.SYSTEM,
      content: `Uploading file ${file.name}...`,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, uploadingMessage])

    // Simulate file processing
    setTimeout(() => {
      const processingMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: MessageType.SYSTEM,
        content: "File is being processed...",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, processingMessage])

      setTimeout(() => {
        const readyMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: MessageType.SYSTEM,
          content: `File ${file.name} is ready. You can start asking questions.`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, readyMessage])
      }, 2000)
    }, 1000)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col lg:flex-row">
      {isMobile ? (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <div className="flex-1 flex flex-col">
            {/* Mobile Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Assistant</h1>
                <p className="text-sm text-gray-600">Ask questions about documents</p>
              </div>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn("flex gap-2", message.type === "user" ? "justify-end" : "justify-start")}
                  >
                    {message.type !== "user" && (
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                          message.type === "assistant" ? "bg-blue-100" : "bg-gray-100",
                        )}
                      >
                        {message.type === "assistant" ? (
                          <Bot className="w-3 h-3 text-blue-600" />
                        ) : (
                          <FileText className="w-3 h-3 text-gray-600" />
                        )}
                      </div>
                    )}

                    <Card
                      className={cn(
                        "max-w-[85%] p-3",
                        message.type === "user"
                          ? "bg-blue-600 text-white"
                          : message.type === "system"
                            ? "bg-amber-50 border-amber-200"
                            : "bg-white",
                      )}
                    >
                      <p className={cn("text-sm leading-relaxed", message.type === "system" && "text-amber-800")}>
                        {message.content}
                      </p>
                      <p
                        className={cn(
                          "text-xs mt-2 opacity-70",
                          message.type === "user" ? "text-blue-100" : "text-gray-500",
                        )}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </Card>

                    {message.type === "user" && (
                      <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {isChatWithAIMutationPending && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-3 h-3 text-blue-600" />
                    </div>
                    <Card className="max-w-[85%] p-3 bg-white">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                          <div
                            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">AI is thinking...</span>
                      </div>
                    </Card>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Mobile Input Area */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask a question..."
                    className="min-h-[44px] max-h-24 resize-none text-sm"
                    disabled={isChatWithAIMutationPending}
                  />
                </div>

                <div className="flex gap-1">
                  <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-[44px] w-10"
                    disabled={isChatWithAIMutationPending}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>

                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isChatWithAIMutationPending}
                    className="h-[44px] w-10 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">Press Enter to send</p>
            </div>
          </div>

          <SheetContent side="left" className="w-80 p-0">
            <ChatSidebar />
          </SheetContent>
        </Sheet>
      ) : (
        <>
          <div className="w-80 xl:w-96">
            <ChatSidebar  />
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
              <p className="text-gray-600">Ask questions about your uploaded documents</p>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6 max-h-[calc(100vh-220px)]">
              <div className="max-w-4xl mx-auto space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn("flex gap-3", message.type === "user" ? "justify-end" : "justify-start")}
                  >
                    {message.type !== "user" && (
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                          message.type === "assistant" ? "bg-blue-100" : "bg-gray-100",
                        )}
                      >
                        {message.type === "assistant" ? (
                          <Bot className="w-4 h-4 text-blue-600" />
                        ) : (
                          <FileText className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                    )}

                    <Card
                      className={cn(
                        "max-w-2xl p-4",
                        message.type === "user"
                          ? "bg-blue-600 text-white"
                          : message.type === "system"
                            ? "bg-amber-50 border-amber-200"
                            : "bg-white",
                      )}
                    >
                      <div className={cn("text-sm leading-relaxed", message.type === "system" && "text-amber-800")}>
                        {formatAnswer(message.content)}
                      </div>
                      <p
                        className={cn(
                          "text-xs mt-2 opacity-70",
                          message.type === "user" ? "text-blue-100" : "text-gray-500",
                        )}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </Card>

                    {message.type === "user" && (
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {isChatWithAIMutationPending && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                    <Card className="max-w-2xl p-4 bg-white">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">AI is thinking...</span>
                      </div>
                    </Card>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask a question about your documents..."
                      className="min-h-[60px] max-h-32 resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isChatWithAIMutationPending}
                    />
                  </div>

                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-[60px] w-12 border-gray-300 hover:bg-gray-50"
                      disabled={isChatWithAIMutationPending}
                    >
                      <Upload className="w-4 h-4" />
                    </Button>

                    <Button
                      onClick={handleSendMessage}
                      disabled={ !inputValue.trim() || isChatWithAIMutationPending}
                      className="h-[60px] w-12 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2 text-center">Press Enter to send, Shift+Enter for new line</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
