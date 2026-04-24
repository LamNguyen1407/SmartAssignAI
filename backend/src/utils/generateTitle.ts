import { GoogleGenAI } from "@google/genai";

export async function generateTitleFromAI(message: string): Promise<string> {
    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
        const prompt = `
            Hãy tạo một tiêu đề ngắn gọn, mô tả (tối đa 6 từ) tóm tắt câu hỏi này.
            Không sử dụng dấu ngoặc kép. Chỉ ghi trực tiếp tiêu đề.
            Câu hỏi: "${message}"
        `;
        const response = await client.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });
        const title = response.text?.trim();
        return title || "New Chat";
    } catch (err) {
        console.error("AI Title Generation Error:", err);
        return "New Chat";
    }
}