import axiosClient from "@/config/axios.config"


export const ChatWithAI = async (question: string) => {
    return await axiosClient.post("http://localhost:3001/test/question", { question: question })
}

export const fetchChatSession = async () => {
    return await axiosClient.get("/chat/get-chat-sessions").then(res => res.data);
}

export const getMessagesBySession = async (chatSessionID: string) => {
    return await axiosClient.get(`/chat/get-messages/${chatSessionID}`).then(res => res.data);
}