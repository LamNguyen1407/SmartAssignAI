import { GoogleGenAI } from "@google/genai";

export async function generateTitleFromAI(message: string): Promise<string> {
    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
        // Model hiện tại nên dùng là gemini-2.0-flash hoặc gemini-1.5-flash
        // (Lưu ý: gemini-2.5 chưa ra mắt, có thể bạn nhầm với 1.5 hoặc 2.0)
        
        const prompt = `
            Create a short, descriptive title (max 6 words) summarizing this message.
            Do NOT use quotes. Only return the title directly.
            Message: "${message}"
        `;

        const response = await client.models.generateContent({
            model: "gemini-2.5-flash-lite", 
            contents: prompt, 
            // // Cấu hình thêm (optional) nếu muốn output ngắn gọn hơn
            // config: {
            //     maxOutputTokens: 20,
            //     temperature: 0.7
            // }
        });

        // Trong SDK mới, response.text là một thuộc tính (property), không phải hàm
        const title = response.text?.trim();
        
        return title || "New Chat";
    } catch (err) {
        console.error("AI Title Generation Error:", err);
        return "New Chat";
    }
}