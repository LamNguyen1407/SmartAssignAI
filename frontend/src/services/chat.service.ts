import axiosClient from "@/config/axios.config";

export const ChatWithAI = async (
  question: string,
  courseId: string,
  chatSessionID?: string,
) => {
  console.log("chatSessionID", chatSessionID);
  return await axiosClient.post("http://localhost:3001/chat/question", {
    question: question,
    courseId: courseId,
    chatSessionID: chatSessionID,
  });
};

export const fetchChatSession = async () => {
  return await axiosClient
    .get("/chat/get-chat-sessions")
    .then((res) => res.data);
};

export const fetchChatSessionById = async (chatSessionID: string) => {
  return await axiosClient
    .get(`/chat/get-session-by-id/${chatSessionID}`)
    .then((res) => res.data);
};

export const getMessagesBySession = async (chatSessionID: string) => {
  return await axiosClient
    .get(`/chat/get-messages/${chatSessionID}`)
    .then((res) => res.data);
};

export const deleteChatSession = async (chatSessionID: string) => {
  return await axiosClient
    .delete(`/chat/deleteChatSession`, { data: { chatSessionID } })
    .then((res) => res.data);
}