// "use client"

// import type React from "react"

// import { useState, useRef, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Textarea } from "@/components/ui/textarea"
// import { Card } from "@/components/ui/card"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
// import { Send, Upload, Bot, User, FileText, Menu, Plus } from "lucide-react"
// import { cn } from "@/lib/utils"
// import { useIsMobile } from "@/hooks/use-mobile"
// import { ChatSession, Message, MessageType } from "@/interface/chat.interface"
// import { useMutation, useQuery } from "@tanstack/react-query"
// import { ChatWithAI, fetchChatSessionById, getMessagesBySession } from "@/services/chat.service"
// import { formatAnswer } from "@/components/formatAnswer"
// import ChatSidebar from "@/components/chat/ChatSidebar"
// import { useParams } from "next/navigation"
// import Markdown from "react-markdown"
// import remarkGfm from "remark-gfm"
// import rehypeHighlight from "rehype-highlight"
// import rehypeRaw from "rehype-raw"
// import { toast } from "react-toastify"


// export default function ChatPage() {
//   const params = useParams<{ id: string }>()
//   const sessionId = params.id;

//   const { data: chatMessages, isLoading: isChatMessagesLoading } = useQuery({
//     queryKey: ["chatMessages", sessionId],
//     queryFn: async () => {
//       const res = await getMessagesBySession(sessionId);
//       return res.data;
//     },
//   })

//   const { data: chatSessionData, isLoading: isChatSessionDataLoading } = useQuery<ChatSession>({
//     queryKey: ["chatSessionData", sessionId],
//     queryFn: async () => {
//       const res = await fetchChatSessionById(sessionId);
//       return res.data;
//     },
//   })


//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: "1",
//       type: MessageType.ASSISTANT,
//       content:
//         "Hello! I'm your AI assistant. Upload a PDF document and I'll help you analyze and answer questions about it.",
//       timestamp: new Date(),
//     },
//   ])

//   const [inputValue, setInputValue] = useState("")

//   const messagesEndRef = useRef<HTMLDivElement>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)
//   const isMobile = useIsMobile()
//   const [sidebarOpen, setSidebarOpen] = useState(false)

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
//   }

//   useEffect(() => {
//     scrollToBottom()
//   }, [messages])

//   const { mutate: ChatWithAIMutation, isPending: isChatWithAIMutationPending } = useMutation({
//     mutationFn: ({ question, courseId }: { question: string, courseId: string }) => ChatWithAI(question, courseId, sessionId),
//     onSuccess: (data) => {
//       const aiMessage: Message = {
//         id: (Date.now() + 1).toString(),
//         type: MessageType.ASSISTANT,
//         content: data.data.answer,
//         timestamp: new Date(),
//       }
//       setMessages((prev) => [...prev, aiMessage])
//     },
//     onError: (error: any) => {
//       const errorMessage: Message = {
//         id: (Date.now() + 2).toString(),
//         type: MessageType.SYSTEM,
//         content: `Error: ${error.message || "Something went wrong"}`,
//         timestamp: new Date(),
//       }
//       setMessages((prev) => [...prev, errorMessage])
//     },
//   })

//   const handleSendMessage = () => {
//     if (!inputValue.trim() || isChatWithAIMutationPending) return

//     const courseId = chatSessionData?.courseId;

//     if (!courseId) {
//       toast.error("Course not ready. Please wait...");
//       return;
//     }

//     const userMessage: Message = {
//       id: Date.now().toString(),
//       type: MessageType.USER,
//       content: inputValue,
//       timestamp: new Date(),
//     }

//     setMessages((prev) => [...prev, userMessage])

//     ChatWithAIMutation({
//       question: inputValue,
//       courseId: courseId._id
//     })

//     setInputValue("")
//   }

//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0]
//     if (!file) return

//     // Show uploading message
//     const uploadingMessage: Message = {
//       id: Date.now().toString(),
//       type: MessageType.SYSTEM,
//       content: `Uploading file ${file.name}...`,
//       timestamp: new Date(),
//     }
//     setMessages((prev) => [...prev, uploadingMessage])

//     // Simulate file processing
//     setTimeout(() => {
//       const processingMessage: Message = {
//         id: (Date.now() + 1).toString(),
//         type: MessageType.SYSTEM,
//         content: "File is being processed...",
//         timestamp: new Date(),
//       }
//       setMessages((prev) => [...prev, processingMessage])

//       setTimeout(() => {
//         const readyMessage: Message = {
//           id: (Date.now() + 2).toString(),
//           type: MessageType.SYSTEM,
//           content: `File ${file.name} is ready. You can start asking questions.`,
//           timestamp: new Date(),
//         }
//         setMessages((prev) => [...prev, readyMessage])
//       }, 2000)
//     }, 1000)

//     // Reset file input
//     if (fileInputRef.current) {
//       fileInputRef.current.value = ""
//     }
//   }

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault()
//       handleSendMessage()
//     }
//   }

//   useEffect(() => {
//     if (!chatMessages) return;

//     // map dữ liệu API thành Message[]
//     const formattedMessages: Message[] = chatMessages.map((msg: any) => ({
//       id: msg._id,
//       type: msg.type === "assistant" ? MessageType.ASSISTANT
//         : msg.type === "system" ? MessageType.SYSTEM
//           : MessageType.USER,
//       content: msg.content,
//       timestamp: new Date(msg.createdAt),
//     }));

//     setMessages(formattedMessages);
//   }, [chatMessages]);

//   useEffect(() => {
//     console.log("messages", messages)
//   }, [messages])

//   useEffect(() => {
//     console.log("chatSessionData", chatSessionData)
//   }, [chatSessionData])

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col lg:flex-row">
//       {isMobile ? (
//         <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
//           <div className="flex-1 flex flex-col">
//             {/* Mobile Header */}
//             <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
//               <div>
//                 <h1 className="text-xl font-bold text-gray-900">AI Assistant</h1>
//                 <p className="text-sm text-gray-600">Ask questions about documents</p>
//               </div>
//               <SheetTrigger asChild>
//                 <Button variant="outline" size="sm">
//                   <Menu className="w-4 h-4" />
//                 </Button>
//               </SheetTrigger>
//             </div>

//             {/* Messages */}
//             <ScrollArea className="flex-1 p-4">
//               <div className="space-y-4">
//                 {messages.map((message) => (
//                   <div
//                     key={message.id}
//                     className={cn("flex gap-2", message.type === "user" ? "justify-end" : "justify-start")}
//                   >
//                     {message.type !== "user" && (
//                       <div
//                         className={cn(
//                           "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
//                           message.type === "assistant" ? "bg-blue-100" : "bg-gray-100",
//                         )}
//                       >
//                         {message.type === "assistant" ? (
//                           <Bot className="w-3 h-3 text-blue-600" />
//                         ) : (
//                           <FileText className="w-3 h-3 text-gray-600" />
//                         )}
//                       </div>
//                     )}

//                     <Card
//                       className={cn(
//                         "max-w-[85%] p-3",
//                         message.type === "user"
//                           ? "bg-blue-600 text-white"
//                           : message.type === "system"
//                             ? "bg-amber-50 border-amber-200"
//                             : "bg-white",
//                       )}
//                     >
//                       <p className={cn("text-sm leading-relaxed", message.type === "system" && "text-amber-800")}>
//                         {message.content}
//                       </p>
//                       <p
//                         className={cn(
//                           "text-xs mt-2 opacity-70",
//                           message.type === "user" ? "text-blue-100" : "text-gray-500",
//                         )}
//                       >
//                         {message.timestamp.toLocaleTimeString()}
//                       </p>
//                     </Card>

//                     {message.type === "user" && (
//                       <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0 mt-1">
//                         <User className="w-3 h-3 text-white" />
//                       </div>
//                     )}
//                   </div>
//                 ))}

//                 {isChatWithAIMutationPending && (
//                   <div className="flex gap-2 justify-start">
//                     <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
//                       <Bot className="w-3 h-3 text-blue-600" />
//                     </div>
//                     <Card className="max-w-[85%] p-3 bg-white">
//                       <div className="flex items-center gap-2">
//                         <div className="flex gap-1">
//                           <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
//                           <div
//                             className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
//                             style={{ animationDelay: "0.1s" }}
//                           />
//                           <div
//                             className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
//                             style={{ animationDelay: "0.2s" }}
//                           />
//                         </div>
//                         <span className="text-sm text-gray-500">AI is thinking...</span>
//                       </div>
//                     </Card>
//                   </div>
//                 )}
//                 <div ref={messagesEndRef} />
//               </div>
//             </ScrollArea>

//             {/* Mobile Input Area */}
//             <div className="bg-white border-t border-gray-200 p-4">
//               <div className="flex gap-2 items-end">
//                 <div className="flex-1">
//                   <Textarea
//                     value={inputValue}
//                     onChange={(e) => setInputValue(e.target.value)}
//                     onKeyPress={handleKeyPress}
//                     placeholder="Ask a question..."
//                     className="min-h-[44px] max-h-24 resize-none text-sm"
//                     disabled={isChatWithAIMutationPending}
//                   />
//                 </div>

//                 <div className="flex gap-1">
//                   <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => fileInputRef.current?.click()}
//                     className="h-[44px] w-10"
//                     disabled={isChatWithAIMutationPending}
//                   >
//                     <Upload className="w-4 h-4" />
//                   </Button>

//                   <Button
//                     onClick={handleSendMessage}
//                     disabled={!inputValue.trim() || isChatWithAIMutationPending}
//                     className="h-[44px] w-10 bg-blue-600 hover:bg-blue-700 text-white"
//                   >
//                     <Send className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </div>
//               <p className="text-xs text-gray-500 mt-2 text-center">Press Enter to send</p>
//             </div>
//           </div>

//           <SheetContent side="left" className="w-80 p-0">
//             <ChatSidebar />
//           </SheetContent>
//         </Sheet>
//       ) : (
//         <>
//           <div className="w-80 xl:w-96">
//             <ChatSidebar />
//           </div>

//           {/* Main Chat Area */}
//           <div className="flex-1 flex flex-col">
//             {/* Header */}
//             <div className="bg-white border-b border-gray-200 p-6">
//               <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
//               <p className="text-gray-600">Ask questions about your uploaded documents</p>
//             </div>

//             {/* Messages */}
//             <ScrollArea className="flex-1 p-6 max-h-[calc(100vh-220px)]">
//               <div className="max-w-4xl mx-auto space-y-4">
//                 {messages.map((message) => (
//                   <div
//                     key={message.id}
//                     className={cn("flex gap-3", message.type === "user" ? "justify-end" : "justify-start")}
//                   >
//                     {message.type !== "user" && (
//                       <div
//                         className={cn(
//                           "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
//                           message.type === "assistant" ? "bg-blue-100" : "bg-gray-100",
//                         )}
//                       >
//                         {message.type === "assistant" ? (
//                           <Bot className="w-4 h-4 text-blue-600" />
//                         ) : (
//                           <FileText className="w-4 h-4 text-gray-600" />
//                         )}
//                       </div>
//                     )}

//                     <Card
//                       className={cn(
//                         "max-w-2xl p-4",
//                         message.type === "user"
//                           ? "bg-blue-600 text-white"
//                           : message.type === "system"
//                             ? "bg-amber-50 border-amber-200"
//                             : "bg-white",
//                       )}
//                     >
//                       <div className={cn("text-sm leading-relaxed", message.type === "system" && "text-amber-800")}>
//                         {/* {formatAnswer(message.content)} */}
//                         <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight, rehypeRaw]}>
//                           {message.content}
//                         </Markdown>
//                       </div>

//                       <p
//                         className={cn(
//                           "text-xs mt-2 opacity-70",
//                           message.type === "user" ? "text-blue-100" : "text-gray-500",
//                         )}
//                       >
//                         {message.timestamp.toLocaleTimeString()}
//                       </p>
//                     </Card>

//                     {message.type === "user" && (
//                       <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
//                         <User className="w-4 h-4 text-white" />
//                       </div>
//                     )}
//                   </div>
//                 ))}

//                 {isChatWithAIMutationPending && (
//                   <div className="flex gap-3 justify-start">
//                     <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
//                       <Bot className="w-4 h-4 text-blue-600" />
//                     </div>
//                     <Card className="max-w-2xl p-4 bg-white">
//                       <div className="flex items-center gap-2">
//                         <div className="flex gap-1">
//                           <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
//                           <div
//                             className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//                             style={{ animationDelay: "0.1s" }}
//                           />
//                           <div
//                             className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//                             style={{ animationDelay: "0.2s" }}
//                           />
//                         </div>
//                         <span className="text-sm text-gray-500">AI is thinking...</span>
//                       </div>
//                     </Card>
//                   </div>
//                 )}
//                 <div ref={messagesEndRef} />
//               </div>
//             </ScrollArea>

//             {/* Input Area */}
//             <div className="bg-white border-t border-gray-200 p-6">
//               <div className="max-w-4xl mx-auto">
//                 <div className="flex gap-3 items-end">
//                   <div className="flex-1">
//                     <Textarea
//                       value={inputValue}
//                       onChange={(e) => setInputValue(e.target.value)}
//                       onKeyPress={handleKeyPress}
//                       placeholder="Ask a question about your documents..."
//                       className="min-h-[60px] max-h-32 resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
//                       disabled={isChatWithAIMutationPending || isChatSessionDataLoading || !chatSessionData?.courseId}
//                     />
//                   </div>

//                   <div className="flex gap-2">
//                     <input
//                       ref={fileInputRef}
//                       type="file"
//                       accept=".pdf"
//                       onChange={handleFileUpload}
//                       className="hidden"
//                     />
//                     <Button
//                       variant="outline"
//                       size="icon"
//                       onClick={() => fileInputRef.current?.click()}
//                       className="h-[60px] w-12 border-gray-300 hover:bg-gray-50"
//                       disabled={isChatWithAIMutationPending}
//                     >
//                       <Upload className="w-4 h-4" />
//                     </Button>

//                     <Button
//                       onClick={handleSendMessage}
//                       disabled={!inputValue.trim() || isChatWithAIMutationPending}
//                       className="h-[60px] w-12 bg-blue-600 hover:bg-blue-700 text-white"
//                     >
//                       <Send className="w-4 h-4" />
//                     </Button>
//                   </div>
//                 </div>

//                 <p className="text-xs text-gray-500 mt-2 text-center">Press Enter to send, Shift+Enter for new line</p>
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   )
// }

"use client"

import React, { useState, useRef, useEffect } from "react"
import { useParams } from "next/navigation"
import { useMutation, useQuery } from "@tanstack/react-query"
import { SendOutlined, RobotOutlined, UserOutlined, HistoryOutlined, CheckCircleFilled, BookOutlined } from "@ant-design/icons"
import { Button, Input, Avatar, Spin, Tooltip, Tag } from "antd"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { toast } from "react-toastify"

import { cn } from "@/lib/utils"
import { Message, MessageType, ChatSession } from "@/interface/chat.interface"
import { ChatWithAI, fetchChatSessionById, getMessagesBySession } from "@/services/chat.service"
import ChatSidebar from "@/components/chat/ChatSidebar"

const { TextArea } = Input

export default function ChatDetailPage() {
  const params = useParams<{ id: string }>()
  const sessionId = params.id

  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: chatMessages, isLoading: isChatMessagesLoading } = useQuery({
    queryKey: ["chatMessages", sessionId],
    queryFn: async () => {
      const res = await getMessagesBySession(sessionId)
      return res.data
    },
    enabled: !!sessionId,
  })

  const { data: chatSessionData } = useQuery<ChatSession>({
    queryKey: ["chatSessionData", sessionId],
    queryFn: async () => {
      const res = await fetchChatSessionById(sessionId)
      return res.data
    },
    enabled: !!sessionId,
  })

  const { mutate: ChatWithAIMutation, isPending: isChatting } = useMutation({
    mutationFn: ({ question, courseId }: { question: string; courseId: string }) =>
      ChatWithAI(question, courseId, sessionId),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: MessageType.ASSISTANT,
          content: data.data.answer,
          timestamp: new Date(),
        },
      ])
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gửi tin nhắn thất bại")
    },
  })

  useEffect(() => {
    if (chatMessages) {
      const formatted: Message[] = chatMessages.map((msg: any) => ({
        id: msg._id,
        type: msg.type === "assistant" ? MessageType.ASSISTANT : MessageType.USER,
        content: msg.content,
        timestamp: new Date(msg.createdAt),
      }))
      setMessages(formatted)
    }
  }, [chatMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isChatting])

  const handleSendMessage = () => {
    if (!inputValue.trim() || isChatting) return

    const courseId = chatSessionData?.courseId?._id
    if (!courseId) {
      toast.error("Thông tin khóa học chưa sẵn sàng")
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: MessageType.USER,
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    ChatWithAIMutation({ question: inputValue, courseId })
    setInputValue("")
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#f9fafb] p-3 sm:p-5">
      <aside className="hidden w-72 lg:flex flex-col bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mr-5">
        <div className="p-5 border-b flex items-center gap-2 font-bold text-gray-700">
          <HistoryOutlined /> Lịch sử hội thoại
        </div>
        <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
          <ChatSidebar />
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-white rounded-[2rem] shadow-md border border-gray-50 overflow-hidden relative">
        {/* HEADER */}
        <header className="px-6 h-20 flex items-center justify-between border-b border-gray-50 bg-white/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <Avatar size={45} className="bg-blue-600 shadow-lg shadow-blue-200" icon={<RobotOutlined />} />
            <div>
              <h2 className="text-sm font-bold text-gray-800">
                {"AI Assistant"}
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] text-green-500 font-bold uppercase tracking-widest">
                <CheckCircleFilled /> AI Đang Trực Tuyến
              </div>
            </div>
          </div>
          <Tag color="blue" className="rounded-full px-3 border-none font-medium">
            {chatSessionData?.courseId?.name ?? "Chế độ học tập"}
          </Tag>
        </header>

        {/* NỘI DUNG CHAT */}
        <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-10 space-y-8 scrollbar-hide">
          {isChatMessagesLoading ? (
            <div className="flex h-full items-center justify-center">
              <Spin size="large" tip="Đang tải hội thoại..." />
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex gap-4", msg.type === MessageType.USER ? "flex-row-reverse" : "flex-row")}
              >
                <Avatar
                  size={38}
                  className={msg.type === MessageType.USER ? "bg-gray-800 shadow-md" : "bg-blue-100 text-blue-600"}
                  icon={msg.type === MessageType.USER ? <UserOutlined /> : <RobotOutlined />}
                />
                <div className={cn("flex max-w-[80%] flex-col gap-1.5", msg.type === MessageType.USER ? "items-end" : "items-start")}>
                  <div
                    className={cn(
                      "px-5 py-3 rounded-[1.8rem] text-sm leading-relaxed shadow-sm",
                      msg.type === MessageType.USER
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-gray-100 text-gray-800 rounded-tl-none"
                    )}
                  >
                    <div className="prose prose-sm max-w-none prose-p:my-1">
                      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                        {msg.content}
                      </Markdown>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 px-2 font-medium">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))
          )}

          {isChatting && (
            <div className="flex gap-4">
              <Avatar size={38} className="bg-blue-50 text-blue-400" icon={<RobotOutlined />} />
              <div className="bg-gray-50 border border-gray-100 px-6 py-4 rounded-[1.5rem] rounded-tl-none flex items-center gap-2">
                <Spin size="small" />
                <span className="text-xs text-gray-400 italic">AI đang trả lời...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA - PHONG CÁCH PILL SHAPE */}
        <div className="p-6 bg-white">
          <div className="max-w-4xl mx-auto flex items-end gap-2 bg-[#f4f4f4] p-2 rounded-[2.5rem] transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 border border-transparent focus-within:border-blue-400 shadow-inner">
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Hỏi trợ lý về tài liệu này..."
              autoSize={{ minRows: 1, maxRows: 6 }}
              variant="borderless"
              className="flex-1 text-sm py-3 px-5 resize-none bg-transparent focus:bg-transparent"
              disabled={isChatting}
            />

            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              loading={isChatting}
              disabled={!inputValue.trim()}
              className="h-11 w-11 flex-shrink-0 bg-blue-600 rounded-full shadow-lg flex items-center justify-center border-none hover:bg-blue-700 active:scale-95 transition-all mb-[2px] mr-[2px]"
            />
          </div>
          <div className="flex justify-center gap-6 mt-3">
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <BookOutlined className="text-[12px]" /> Nhấn <b>Enter</b> để gửi
            </span>
            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-semibold text-blue-500">
              <CheckCircleFilled className="text-[12px]" /> Kiến thức chuẩn xác từ Server
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}