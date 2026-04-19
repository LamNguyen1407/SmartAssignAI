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
// import { ChatWithAI, fetchChatSession } from "@/services/chat.service"
// import { formatAnswer } from "@/components/formatAnswer"
// import ChatSidebar from "@/components/chat/ChatSidebar"
// import { useRouter } from "next/navigation"
// import { toast } from "react-toastify"
// import Markdown from "react-markdown"
// import remarkGfm from "remark-gfm"
// import rehypeHighlight from "rehype-highlight"
// import { fetchCourses } from "@/services/course.service"
// import { Course } from "@/interface/course.interface"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


// export default function ChatPage() {
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: "1",
//       type: MessageType.ASSISTANT,
//       content:
//         "Hello! I'm your AI assistant. Upload a PDF document and I'll help you analyze and answer questions about it.",
//       timestamp: new Date(),
//     },
//   ])

//   const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

//   const router = useRouter();


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
//     mutationFn: ({ question, courseId }: { question: string, courseId: string }) => ChatWithAI(question, courseId),
//     onSuccess: (data) => {
//       router.push(`/chat/${data.data.chatSessionID}`);
//     },
//     onError: (error: any) => {
//       console.log(error);
//       toast.error(error.response?.data?.message || "❌ Chat failed")
//     },
//   })

//   const { data: courseData } = useQuery<Course[]>({
//     queryKey: ["course"],
//     queryFn: () => fetchCourses(),
//   })

//   const handleSendMessage = () => {
//     if (!inputValue.trim() || isChatWithAIMutationPending) return

//     if (!selectedCourseId) {
//       toast.error("Please select a course before asking questions.");
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
//       courseId: selectedCourseId || "",
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
//     console.log("Selected course ID:", selectedCourseId);
//   }, [selectedCourseId]);

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
//             <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center gap-6">
//               {/* Header */}
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
//                 <p className="text-gray-600">
//                   Ask questions about your assignments of selected course
//                 </p>
//               </div>

//               {/* Course Selection */}
//               <div className="w-[260px]">
//                 <Select
//                   value={selectedCourseId || ""}
//                   onValueChange={(value) => setSelectedCourseId(value)}
//                 >
//                   <SelectTrigger className="w-full">
//                     <SelectValue placeholder={courseData ? "Select a course" : "Loading..."} />
//                   </SelectTrigger>

//                   <SelectContent>
//                     {courseData?.map((course) => (
//                       <SelectItem key={course._id} value={course._id}>
//                         {course.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
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
//                         <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
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
//                       disabled={isChatWithAIMutationPending}
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

"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  CheckCircleFilled,
  HistoryOutlined,
  BookOutlined,
  WarningOutlined
} from "@ant-design/icons";
import { Select, Button, Input, Avatar, Spin, Tag, Tooltip } from "antd";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchCourses } from "@/services/course.service";
import { ChatWithAI } from "@/services/chat.service";
import ChatSidebar from "@/components/chat/ChatSidebar";
import { Message, MessageType } from "@/interface/chat.interface";
import { toast } from "react-toastify";

const { TextArea } = Input;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: MessageType.ASSISTANT,
      content: "Xin chào! Tôi là trợ lý học tập AI. Vui lòng chọn một khóa học phía trên để tôi có thể hỗ trợ bạn chính xác nhất.",
      timestamp: new Date(),
    },
  ]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: courseData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["courses"],
    queryFn: () => fetchCourses(),
  });

  const { mutate: chatMutation, isPending: isChatting } = useMutation({
    mutationFn: (vars: { question: string; courseId: string }) =>
      ChatWithAI(vars.question, vars.courseId),
    onSuccess: (data) => {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        type: MessageType.ASSISTANT,
        content: data.data.answer,
        timestamp: new Date(),
      }]);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi kết nối với AI");
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!selectedCourseId) {
      toast.warn("Vui lòng chọn một khóa học trước khi đặt câu hỏi!");
      return;
    }
    if (!inputValue.trim() || isChatting) return;
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      type: MessageType.USER,
      content: inputValue,
      timestamp: new Date(),
    }]);
    chatMutation({ question: inputValue, courseId: selectedCourseId });
    setInputValue("");
  };

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
        <header className="px-6 h-20 flex items-center justify-between border-b border-gray-50 bg-white/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar size={45} className="bg-blue-600 shadow-lg shadow-blue-200" icon={<RobotOutlined />} />
              <div className={cn("absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full", selectedCourseId ? "bg-green-500" : "bg-gray-400")}></div>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">Trợ lý học tập AI</h2>
              {selectedCourseId ? (
                <div className="flex items-center gap-1.5 text-[11px] text-blue-500 font-semibold uppercase tracking-wider">
                  <CheckCircleFilled /> Tài liệu đã sẵn sàng
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-500 font-semibold uppercase tracking-wider">
                  <WarningOutlined /> Vui lòng chọn môn học
                </div>
              )}
            </div>
          </div>
          <Select
            placeholder="Chọn khóa học để bắt đầu"
            className="w-64"
            size="large"
            bordered={false}
            loading={isLoadingCourses}
            style={{ backgroundColor: '#f3f4f6', borderRadius: '1rem' }}
            onChange={setSelectedCourseId}
            options={courseData?.map((c: any) => ({ value: c._id, label: c.name }))}
          />
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scrollbar-hide">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-4", msg.type === MessageType.USER ? "flex-row-reverse" : "flex-row")}>
              <Avatar
                size={38}
                className={msg.type === MessageType.USER ? "bg-gray-800 shadow-md" : "bg-blue-100 text-blue-600"}
                icon={msg.type === MessageType.USER ? <UserOutlined /> : <RobotOutlined />}
              />
              <div className={cn("flex max-w-[75%] flex-col gap-1.5", msg.type === MessageType.USER ? "items-end" : "items-start")}>
                <div className={cn(
                  "px-5 py-3.5 text-sm shadow-sm leading-relaxed",
                  msg.type === MessageType.USER
                    ? "bg-blue-600 text-white rounded-[1.5rem] rounded-tr-none"
                    : "bg-gray-100 text-gray-800 rounded-[1.5rem] rounded-tl-none"
                )}>
                  <div className="prose prose-sm max-w-none break-words">
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </Markdown>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 px-2 uppercase font-medium">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isChatting && (
            <div className="flex gap-4 animate-pulse">
              <Avatar size={38} className="bg-blue-50 text-blue-400" icon={<RobotOutlined />} />
              <div className="bg-gray-50 border border-gray-100 px-6 py-4 rounded-[1.5rem] rounded-tl-none">
                <div className="flex gap-1 items-center">
                  <Spin size="small" className="mr-2" />
                  <span className="text-xs text-gray-400 italic">AI đang trả lời...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="bg-white p-4 border-t lg:p-6">
          <Tooltip
            title={!selectedCourseId ? "Bạn phải chọn khóa học trước khi đặt câu hỏi" : ""}
            color="orange"
            placement="top"
          >
            <div className={cn(
              "max-w-4xl mx-auto flex items-end gap-2 p-2 rounded-[2.5rem] transition-all border",
              !selectedCourseId
                ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-70"
                : "bg-[#f4f4f4] border-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400"
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
                placeholder={selectedCourseId ? "Hỏi trợ lý về khóa học..." : "Hãy chọn khóa học phía trên..."}
                autoSize={{ minRows: 1, maxRows: 6 }}
                variant="borderless"
                className="flex-1 text-sm py-2 px-4 resize-none bg-transparent focus:bg-transparent placeholder:text-gray-400"
                disabled={isChatting || !selectedCourseId}
              />
              <Button
                type="primary"
                icon={<SendOutlined style={{ fontSize: '16px' }} />}
                onClick={handleSendMessage}
                loading={isChatting}
                disabled={!selectedCourseId || !inputValue.trim()}
                className="h-10 w-10 flex-shrink-0 bg-blue-600 rounded-full shadow-md flex items-center justify-center border-none hover:bg-blue-700 active:scale-95 transition-all mb-[2px] mr-[2px] disabled:bg-gray-300"
              />
            </div>
          </Tooltip>
          <p className="mt-2 text-center text-[11px] text-gray-400">
            Nhấn <span className="font-semibold">Enter</span> để gửi, <span className="font-semibold">Shift + Enter</span> để xuống dòng
          </p>
        </div>
      </main>
    </div>
  );
}