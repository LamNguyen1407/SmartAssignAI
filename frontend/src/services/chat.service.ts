import axiosClient from "@/config/axios.config";

export const ChatWithAI = async (question: string, chatSessionID?: string) => {
  return await axiosClient.post("http://localhost:3001/chat/question", {
    question: question,
    chatSessionID: chatSessionID,
  });
};

export const fetchChatSession = async () => {
  return await axiosClient
    .get("/chat/get-chat-sessions")
    .then((res) => res.data);
};

export const getMessagesBySession = async (chatSessionID: string) => {
  return await axiosClient
    .get(`/chat/get-messages/${chatSessionID}`)
    .then((res) => res.data);
};
