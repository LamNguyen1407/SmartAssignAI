import axiosClient from "@/config/axios.config"


export const ChatWithAI = async (question: string) => {
    return axiosClient.post("http://localhost:3001/test/question", { question: question })
}