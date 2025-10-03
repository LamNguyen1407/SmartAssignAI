import axiosClient from "@/config/axios.config"


export const ChatWithAI = async (question: string) => {
    return axiosClient.post("/test/question", { question })
}