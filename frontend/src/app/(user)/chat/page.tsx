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
} from "@ant-design/icons";
import { Select, Button, Input, Avatar, Tag } from "antd";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchCourses } from "@/services/course.service";
import { ChatWithAI } from "@/services/chat.service";
import ChatSidebar from "@/components/chat/ChatSidebar";
import { Message, MessageType } from "@/interface/chat.interface";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const { TextArea } = Input;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: MessageType.ASSISTANT,
      content: "Bài tập lớn đang làm khó bạn? Đừng lo, chọn môn học phía trên để cùng mình cùng bắt đầu nhé!",
      timestamp: new Date(),
    },
  ]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: courseData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["courses"],
    queryFn: () => fetchCourses(),
  });

  const { mutate: chatMutation, isPending: isChatting } = useMutation({
    mutationFn: (vars: { question: string; courseId: string }) =>
      ChatWithAI(vars.question, vars.courseId),
    onSuccess: (data) => {
      router.push(`/chat/${data.data.chatSessionID}`);
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
      toast.warn("Vui lòng chọn khóa học trước khi bắt đầu!");
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
    <div className="flex h-[calc(100vh-80px)] bg-[#F0F2F5] p-3 lg:p-5 gap-6">
      <aside className="hidden lg:flex w-72 flex-col bg-[#1E293B] rounded-[2rem] shadow-2xl overflow-hidden border border-slate-700/50 transition-all">
        <ChatSidebar />
      </aside>

      <main className="flex-1 flex flex-col bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden relative">
        <header className="px-6 h-16 flex items-center justify-between border-b border-gray-50 bg-white/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center animate-pulse">
              <RobotOutlined className="text-blue-600" />
            </div>
            <h2 className="text-sm font-bold text-gray-700 tracking-wide uppercase">Trợ lý hỗ trợ bài tập</h2>
          </div>

          <Select
            placeholder="Chọn khóa học để hỏi"
            className="w-64 select-modern"
            bordered={false}
            style={{ background: '#f1f5f9', borderRadius: '12px' }}
            loading={isLoadingCourses}
            onChange={setSelectedCourseId}
            options={courseData?.map((c: any) => ({ value: c._id, label: c.name }))}
          />
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-[#FAFAFB] scrollbar-hide custom-scroll bg-gray-200">
          {messages.map((msg) => (
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
                  "mt-1 shrink-0 shadow-md",
                  msg.type === MessageType.USER ? "bg-slate-800" : "bg-blue-600"
                )}
                icon={msg.type === MessageType.USER ? <UserOutlined /> : <RobotOutlined />}
              />
              <div className={cn("flex flex-col gap-1.5 w-full", msg.type === MessageType.USER ? "items-end" : "items-start")}>
                <div className={cn(
                  "px-5 py-3 text-[14.5px] leading-relaxed shadow-sm transition-all hover:shadow-md",
                  "w-fit max-w-[85%] lg:max-w-[75%]",
                  msg.type === MessageType.USER
                    ? "bg-[#007AFF] text-white rounded-[1.5rem] rounded-tr-none"
                    : "bg-white border border-gray-100 text-gray-800 rounded-[1.5rem] rounded-tl-none"
                )}>
                  <div className={cn(
                    "prose prose-sm max-w-none prose-p:my-0 break-words whitespace-pre-wrap",
                    msg.type === MessageType.USER ? "prose-invert" : ""
                  )}>
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                    >
                      {msg.content}
                    </Markdown>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 font-bold px-2 opacity-70">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isChatting && (
            <div className="flex gap-3 items-center ml-2">
              <div className="flex gap-1.5 bg-gray-100 p-3 rounded-2xl shadow-inner animate-pulse">
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
              selectedCourseId ? "focus-within:bg-white focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100" : "opacity-60 grayscale"
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
                placeholder={selectedCourseId ? "Hỏi trợ lý ..." : "Chọn môn học phía trên để bắt đầu..."}
                autoSize={{ minRows: 1, maxRows: 10 }}
                variant="borderless"
                className="flex-1 text-[15px] py-1 bg-transparent focus:bg-transparent placeholder:text-gray-400"
                disabled={isChatting || !selectedCourseId}
              />

              <div className={cn(
                "overflow-hidden transition-all duration-300 ease-out flex items-center",
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
        
        /* Animation */
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(0.5rem); } to { transform: translateY(0); } }
        .animate-in { animation: fade-in 0.3s ease-out, slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
}