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
import { SendOutlined, RobotOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Input, Avatar, Spin, Tag } from "antd"
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
    <div className="flex h-[calc(100vh-80px)] bg-[#F0F2F5] p-3 lg:p-5 gap-6">
      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-72 flex-col bg-[#1E293B] rounded-[2rem] shadow-2xl overflow-hidden border border-slate-700/50 transition-all">
        <ChatSidebar />
      </aside>

      {/* MAIN CHAT */}
      <main className="flex-1 flex flex-col bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden relative">
        <header className="px-6 h-16 flex items-center justify-between border-b border-gray-50 bg-white/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center animate-pulse">
              <RobotOutlined className="text-blue-600" />
            </div>
            <h2 className="text-sm font-bold text-gray-700 tracking-wide uppercase">Trợ lý hỗ trợ bài tập</h2>
          </div>

          <Tag color="blue" className="rounded-xl px-4 py-1 border-none font-semibold bg-slate-100 text-slate-600">
            {chatSessionData?.courseId?.name ?? "Đang tải..."}
          </Tag>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-[#FAFAFB] scrollbar-hide custom-scroll bg-gray-200">
          {isChatMessagesLoading ? (
            <div className="flex h-full items-center justify-center">
              <Spin size="large" />
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                  msg.type === MessageType.USER ? "flex-row-reverse" : "flex-row"
                )}
              >
                <Avatar
                  size={32}
                  className={cn(
                    "mt-1 shrink-0 shadow-md transition-transform hover:scale-110",
                    msg.type === MessageType.USER ? "bg-slate-800" : "bg-blue-600"
                  )}
                  icon={msg.type === MessageType.USER ? <UserOutlined /> : <RobotOutlined />}
                />

                <div className={cn(
                  "flex flex-col gap-1.5 w-full", // Thêm w-full để container bọc ngoài ổn định
                  msg.type === MessageType.USER ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "px-5 py-3 text-[14.5px] leading-relaxed shadow-sm transition-all hover:shadow-md",
                    "w-fit max-w-[85%] lg:max-w-[75%]", // w-fit là chìa khóa chống xuống dòng vô lý
                    msg.type === MessageType.USER
                      ? "bg-[#007AFF] text-white rounded-[1.5rem] rounded-tr-none"
                      : "bg-white border border-gray-100 text-gray-800 rounded-[1.5rem] rounded-tl-none"
                  )}>
                    <div className={cn(
                      "prose prose-sm max-w-none prose-p:my-0 break-words whitespace-pre-wrap",
                      msg.type === MessageType.USER ? "prose-invert" : ""
                    )}>
                      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                        {msg.content}
                      </Markdown>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-semibold px-2 opacity-70">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}

          {isChatting && (
            <div className="flex gap-3 items-center ml-2 animate-bounce">
              <div className="flex gap-1.5 bg-gray-100 p-3 rounded-2xl shadow-inner">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-50">
          <div className="max-w-3xl mx-auto flex items-center gap-2">
            <div className={cn(
              "flex-1 flex items-end bg-[#F0F2F5] rounded-[2rem] px-5 py-2.5 transition-all border border-transparent shadow-inner group",
              "focus-within:bg-white focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100"
            )}>
              <TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Hỏi trợ lý..."
                autoSize={{ minRows: 1, maxRows: 10 }}
                variant="borderless"
                className="flex-1 text-[15px] py-1 bg-transparent focus:bg-transparent placeholder:text-gray-400"
                disabled={isChatting}
              />

              <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out flex items-center",
                inputValue.trim() ? "w-10 opacity-100 ml-2" : "w-0 opacity-0"
              )}>
                <Button
                  type="text"
                  shape="circle"
                  icon={<SendOutlined className="!text-white" />}
                  onClick={handleSendMessage}
                  loading={isChatting}
                  className="!bg-black hover:!bg-gray-600 border-none shadow-lg shrink-0 scale-110 active:scale-95 transition-all flex items-center justify-center"
                />
              </div>
            </div>
          </div>
          <p className="text-center mt-3 text-[11px] text-gray-400 font-medium italic">
            AI có thể mắc sai sót, vui lòng xác thực lại thông tin quan trọng!
          </p>
        </div>
      </main>

      <style jsx global>{`
      .scrollbar-hide::-webkit-scrollbar { display: none; }
      .custom-scroll::-webkit-scrollbar { width: 4px; }
      .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      
      /* Animation cho tin nhắn mới */
      @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slide-in-from-bottom-2 { from { transform: translateY(0.5rem); } to { transform: translateY(0); } }
      .animate-in { animation: fade-in 0.3s ease-out, slide-in-from-bottom-2 0.3s ease-out; }
    `}</style>
    </div>
  )
}