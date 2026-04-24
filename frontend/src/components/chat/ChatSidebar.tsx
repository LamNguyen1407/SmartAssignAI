// "use client"

// import { MessageSquare, MoveLeft, Plus } from "lucide-react";
// import { Button } from "../ui/button";
// import { ScrollArea } from "../ui/scroll-area";
// import { Card } from "../ui/card";
// import { ChatSession } from "@/interface/chat.interface";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { fetchChatSession } from "@/services/chat.service";
// import Link from "next/link";
// import { CloseOutlined } from '@ant-design/icons';
// import { deleteChatSession } from "@/services/chat.service";
// import { toast } from "react-toastify";
// import { useState } from "react";
// import { Modal } from 'antd';
// import { useParams, useRouter } from "next/navigation";

// export default function ChatSidebar() {
//   const params = useParams<{ id: string }>()
//   const sessionId = params.id;
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [title, setTitle] = useState("");
//   const [chatSessionID, setChatSessionID] = useState("");
//   const queryClient = useQueryClient();
//   const router = useRouter();
//   const { data: chatSessions = [] } = useQuery<ChatSession[]>({
//     queryKey: ["chatSession"],
//     queryFn: async () => {
//       const res = await fetchChatSession();
//       //  console.log(res.data);
//       return res.data;
//     },
//   })

//   const { mutate: deleteSession, isPending: isDeleting } = useMutation({
//     mutationFn: async (chatSessionID: string) => {
//       const res = await deleteChatSession(chatSessionID);
//       setIsModalOpen(false);
//       setTitle("");
//       return res.data;
//     },
//     onSuccess(data) {
//       queryClient.invalidateQueries({ queryKey: ['chatSession'] });
//       if (sessionId === chatSessionID) {
//         router.push('/chat');
//       }
//       setChatSessionID("");
//       toast.success("Xóa thành công!", { autoClose: 2000 });
//     },
//     onError: (error: any) => {
//       setChatSessionID("");
//       toast.error("Xóa thất bại: " + error.message, { autoClose: 5000 });
//     }
//   })

//   const handleDelete = (id: string) => {
//     setChatSessionID(id);
//     setIsModalOpen(true);
//   }

//   const handleCancel = () => {
//     setChatSessionID("");
//     setIsModalOpen(false);
//     setTitle("");
//   }

//   const handleOk = () => {
//     deleteSession(chatSessionID);
//   }

//   return (
//     <>
//       <div className="h-full bg-white flex flex-col">
//         {/* <div className="p-4 lg:p-6 border-b border-gray-200"> */}
//         {/* <div className="flex justify-between">
//             <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Chat Sessions</h2>
//             <Link href="/dashboard" className="text-xs text-gray-600 hover:underline">
//               <MoveLeft />
//             </Link>
//           </div> */}
//         <Link href="/chat">
//           <Button className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer text-white text-sm">
//             <Plus className="w-4 h-4 mr-2" />
//             New Chat
//           </Button>
//         </Link>

//         <ScrollArea className="flex-1 p-3 lg:p-4 max-h-[calc(100vh-64px)] scroll-auto">
//           <div className="flex flex-col gap-3">
//             {chatSessions.map((session) => (
//               <div className="relative group">
//                 <Link href={`/chat/${session._id}`}>
//                   <Card
//                     key={session._id}
//                     className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer"
//                   >
//                     <div className="flex gap-3">
//                       <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
//                         <MessageSquare className="w-4 h-4" />
//                       </div>

//                       <div className="flex-1 flex flex-col gap-1">
//                         <h3 className="font-semibold text-sm text-gray-900 line-clamp-1 group-hover:text-blue-600">
//                           {session.title}
//                         </h3>

//                         <div className="flex justify-between items-center">
//                           <span className="text-xs text-gray-500">
//                             {session.courseId.name}
//                           </span>
//                           <span className="text-[11px] text-gray-400">
//                             {new Date(session.createdAt).toLocaleDateString()}
//                           </span>
//                         </div>
//                       </div>

//                     </div>
//                   </Card>
//                 </Link>
//                 <button
//                   disabled={isDeleting}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleDelete(session._id);
//                     setIsModalOpen(true);
//                     setTitle(session.title);
//                   }}
//                   className="absolute top-1 right-3 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 
//                  hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 
//                  transition-all duration-200 ease-in-out border border-transparent hover:border-red-100"
//                 >
//                   <CloseOutlined className="text-[12px]" />
//                 </button>
//               </div>
//             ))}
//           </div>
//         </ScrollArea>
//       </div>
//       <Modal
//         title={null}
//         open={isModalOpen}
//         onCancel={handleCancel}
//         footer={null}
//         centered
//         closable={false}
//         width={400}
//         className="rounded-2xl overflow-hidden"
//       >
//         <div className="flex flex-col items-center p-4 text-center">
//           <h3 className="text-lg font-bold text-gray-900 mb-2">
//             Xác nhận xóa cuộc hội thoại?
//           </h3>
//           <p className="text-sm text-gray-500 mb-8 px-4">
//             Bạn có chắc là muốn xóa đoạn chat <span className="font-semibold text-gray-700">"{title}"</span> không?.
//             Hành động này không thể hoàn tác và mọi dữ liệu liên quan sẽ bị mất.
//           </p>
//           <div className="flex gap-3 w-full">
//             <button
//               onClick={handleCancel}
//               className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
//             >
//               Hủy bỏ
//             </button>
//             <button
//               onClick={handleOk}
//               disabled={isDeleting}
//               className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 active:scale-95 transition-all disabled:bg-red-300"
//             >
//               {isDeleting ? 'Đang xóa...' : 'Vâng, xóa đi'}
//             </button>
//           </div>
//         </div>
//       </Modal>
//     </>
//   );
// }

"use client"

import { Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { ChatSession } from "@/interface/chat.interface";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchChatSession, deleteChatSession } from "@/services/chat.service";
import Link from "next/link";
import { toast } from "react-toastify";
import { useState } from "react";
import { Modal, Avatar, Card } from 'antd';
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { HistoryOutlined, MessageOutlined } from "@ant-design/icons";
import { useAuthStore } from "@/stores/useAuthStore";

export default function ChatSidebar() {
  const { name, role } = useAuthStore();
  const params = useParams<{ id: string }>()
  const currentSessionId = params.id;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetTitle, setTargetTitle] = useState("");
  const [chatSessionID, setChatSessionID] = useState("");

  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: chatSessions = [] } = useQuery<ChatSession[]>({
    queryKey: ["chatSession"],
    queryFn: async () => {
      const res = await fetchChatSession();
      return res.data;
    },
  })

  const { mutate: deleteSession, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteChatSession(id);
      return res.data;
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['chatSession'] });
      if (currentSessionId === chatSessionID) {
        router.push('/chat');
      }
      setIsModalOpen(false);
      setChatSessionID("");
      toast.success("Đã dọn dẹp cuộc hội thoại");
    },
    onError: (error: any) => {
      toast.error("Không thể xóa: " + error.message);
    }
  })

  const confirmDelete = (e: React.MouseEvent, id: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    setChatSessionID(id);
    setTargetTitle(title);
    setIsModalOpen(true);
  }

  return (
    <>
      <div className="flex flex-col h-full bg-transparent text-slate-300">
        <div className="p-4">
          <Link href="/chat">
            <button className="w-full group flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all active:scale-95 shadow-lg">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-sm font-bold tracking-tight group-hover:text-blue-600">Cuộc hội thoại mới</span>
            </button>
          </Link>
        </div>

        <div className="px-6 py-2 flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
          <HistoryOutlined /> Gần đây
        </div>

        <ScrollArea className="flex-1 w-full max-h-[calc(100vh-320px)]">
          <div className="flex flex-col gap-3 p-3">
            {chatSessions.map((session) => {
              const isActive = currentSessionId === session._id;
              return (
                <div key={session._id} className="relative group w-full overflow-visible">
                  <Link href={`/chat/${session._id}`} className="block w-full">
                    <Card
                      styles={{ body: { padding: '16px' } }}
                      className={cn(
                        "rounded-xl border transition-all duration-500 cursor-pointer relative overflow-hidden",
                        "backdrop-blur-sm",
                        isActive
                          ? "!bg-slate-800/80 !border-blue-500/60 shadow-[0_0_25px_rgba(59,130,246,0.2)]"
                          : "!bg-[#2D3A4F] !border-slate-700/50 text-slate-400 shadow-none hover:!bg-[#2D3A4F] hover:!border-blue-500/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:-translate-y-1"
                      )}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent,rgba(59,130,246,0.1),transparent)] animate-[spin_4s_linear_infinite]" />
                      </div>
                      <div className="flex w-[95%] gap-3">
                        <div className={cn(
                          "w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 shrink-0",
                          isActive
                            ? "bg-blue-500/20 text-white shadow-lg shadow-blue-500/20 scale-110"
                            : "bg-slate-900/50 text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 group-hover:scale-110"
                        )}>
                          <MessageOutlined className="w-4 h-4" />
                        </div>

                        <div className="flex-1 flex flex-col gap-1">
                          <h3 className="font-semibold text-sm text-white line-clamp-1 group-hover:text-blue-400">
                            {session.title}
                          </h3>

                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 group-hover:text-blue-600">
                              {session.courseId.name}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {new Date(session.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                      </div>
                    </Card>
                  </Link>
                  <button
                    disabled={isDeleting}
                    onClick={(e) => confirmDelete(e, session._id, session.title)}
                    className="absolute right-3 top-3/7 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all duration-300 z-20 shadow-xl"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="p-4 bg-slate-800/40 border-t border-slate-700/50">
          <div className="flex items-center gap-3 px-2">
            <Avatar className="bg-orange-500 text-xs">{name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
            }</Avatar>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-slate-200">{name}</span>
              <span className="text-[10px] text-slate-500 italic">{role}</span>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title={null}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        closable={false}
        width={340}
        className="dark-modal"
      >
        <div className="flex flex-col items-center p-2 text-center">
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-2">
            Xóa cuộc hội thoại?
          </h3>
          <p className="text-xs text-slate-500 mb-6 px-2 leading-relaxed">
            Hành động này sẽ xóa vĩnh viễn <span className="text-slate-900 font-semibold italic">"{targetTitle}"</span>.
          </p>
          <div className="flex gap-2 w-full">
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            >
              HỦY
            </button>
            <button
              onClick={() => deleteSession(chatSessionID)}
              disabled={isDeleting}
              className="flex-1 py-2 text-xs font-bold bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all active:scale-95 disabled:bg-red-300"
            >
              {isDeleting ? "ĐANG XÓA..." : "XÁC NHẬN"}
            </button>
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        .dark-modal .ant-modal-content {
          border-radius: 24px !important;
          padding: 24px !important;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}