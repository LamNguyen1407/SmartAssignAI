"use client"

import { MessageSquare, MoveLeft, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Card } from "../ui/card";
import { ChatSession } from "@/interface/chat.interface";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchChatSession } from "@/services/chat.service";
import Link from "next/link";
import { CloseOutlined } from '@ant-design/icons';
import { deleteChatSession } from "@/services/chat.service";
import { toast } from "react-toastify";
import { useState } from "react";
import { Modal } from 'antd';
import { useParams, useRouter } from "next/navigation";

export default function ChatSidebar() {
  const params = useParams<{ id: string }>()
  const sessionId = params.id;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [chatSessionID, setChatSessionID] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: chatSessions = [] } = useQuery<ChatSession[]>({
    queryKey: ["chatSession"],
    queryFn: async () => {
      const res = await fetchChatSession();
      //  console.log(res.data);
      return res.data;
    },
  })

  const { mutate: deleteSession, isPending: isDeleting } = useMutation({
    mutationFn: async (chatSessionID: string) => {
      const res = await deleteChatSession(chatSessionID);
      setIsModalOpen(false);
      setTitle("");
      return res.data;
    },
    onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: ['chatSession'] });
      if (sessionId === chatSessionID) {
        router.push('/chat');
      }
      setChatSessionID("");
      toast.success("Xóa thành công!", { autoClose: 2000 });
    },
    onError: (error: any) => {
      setChatSessionID("");
      toast.error("Xóa thất bại: " + error.message, { autoClose: 5000 });
    }
  })

  const handleDelete = (id: string) => {
    setChatSessionID(id);
    setIsModalOpen(true);
  }

  const handleCancel = () => {
    setChatSessionID("");
    setIsModalOpen(false);
    setTitle("");
  }

  const handleOk = () => {
    deleteSession(chatSessionID);
  }

  return (
    <>
      <div className="h-full bg-white flex flex-col">
        {/* <div className="p-4 lg:p-6 border-b border-gray-200"> */}
        {/* <div className="flex justify-between">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Chat Sessions</h2>
            <Link href="/dashboard" className="text-xs text-gray-600 hover:underline">
              <MoveLeft />
            </Link>
          </div> */}
        <Link href="/chat">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer text-white text-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </Link>

        {/* </div> */}

        <ScrollArea className="flex-1 p-3 lg:p-4 max-h-[calc(100vh-64px)] scroll-auto">
          <div className="flex flex-col gap-3">
            {chatSessions.map((session) => (
              <div className="relative group">
                <Link href={`/chat/${session._id}`}>
                  <Card
                    key={session._id}
                    className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex gap-3">
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <MessageSquare className="w-4 h-4" />
                      </div>

                      <div className="flex-1 flex flex-col gap-1">
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-1 group-hover:text-blue-600">
                          {session.title}
                        </h3>

                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(session._id);
                    setIsModalOpen(true);
                    setTitle(session.title);
                  }}
                  className="absolute top-1 right-3 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 
                 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 
                 transition-all duration-200 ease-in-out border border-transparent hover:border-red-100"
                >
                  <CloseOutlined className="text-[12px]" />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      <Modal
        title={null}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        centered
        closable={false}
        width={400}
        className="rounded-2xl overflow-hidden"
      >
        <div className="flex flex-col items-center p-4 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Xác nhận xóa cuộc hội thoại?
          </h3>
          <p className="text-sm text-gray-500 mb-8 px-4">
            Bạn có chắc là muốn xóa đoạn chat <span className="font-semibold text-gray-700">"{title}"</span> không?.
            Hành động này không thể hoàn tác và mọi dữ liệu liên quan sẽ bị mất.
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={handleCancel}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleOk}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 active:scale-95 transition-all disabled:bg-red-300"
            >
              {isDeleting ? 'Đang xóa...' : 'Vâng, xóa đi'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}