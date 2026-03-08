import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Metadata, MetadataDocument } from 'src/model/schemas/metadata.schema';
import {
  ChatSession,
  ChatSessionDocument,
} from 'src/model/schemas/chatSession.schema';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateTitleFromAI } from 'src/utils/generateTitle';
import { DocumentFile } from 'src/model/schemas/document.schema';
import { Message, MessageDocument } from 'src/model/schemas/message.schema';
import { MessageType } from 'src/interface/type';
import { SchemaType } from '@google/generative-ai';
import Groq from 'groq-sdk';
import OpenAI from "openai";

@Injectable()
export class ChatService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Metadata.name) private metadataModel: Model<MetadataDocument>,
    @InjectModel(ChatSession.name)
    private chatSessionModel: Model<ChatSessionDocument>,
    @InjectModel(DocumentFile.name)
    private documentFileModel: Model<DocumentFile>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) { }

  private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  private groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  private openai = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: process.env.DEEPSEEK_API_KEY
  });

  async createMessage(objs: {
    sessionId: string;
    type: MessageType;
    content: string;
    contextContent?: string;
  }) {
    return await new this.messageModel({
      sessionId: objs.sessionId,
      type: objs.type,
      content: objs.content,
      contextContent: objs.contextContent || '',
    }).save();
  }

  async getMessagesBySession(sessionId: string, num?: number) {
    const session = await this.chatSessionModel.findById(sessionId).exec();
    if (!session) {
      throw new NotFoundException('Chat session not found');
    }
    let msgs = await this.messageModel
      .find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(num)
      .exec();
    return msgs.reverse();
  }

  async create_many(
    objs: {
      chunks: number;
      embedding: number[];
      text: string;
      fileId: string;
    }[],
  ) {
    return this.metadataModel.insertMany(objs);
  }

  async create_documentFile(objs: {
    filename: string;
    url: string;
    mimetype: string;
    size: number;
    userId: string;
    sessionId?: string;
  }) {
    return await new this.documentFileModel({
      filename: objs.filename,
      url: objs.url,
      mimetype: objs.mimetype,
      size: objs.size,
      userId: objs.userId,
      sessionId: objs.sessionId,
    }).save();
  }

  async findOne(id: string) {
    return await this.chatSessionModel.findById(id).exec();
  }

  async create(objs: { userID: any; title: string }) {
    return await new this.chatSessionModel({
      userId: objs.userID,
      title: objs.title,
    }).save();
  }

  async createChatSession(firstMessage: string, userId: string) {
    const title = await generateTitleFromAI(firstMessage);
    return await this.create({ userID: userId, title });
  }

  async getChatSession(userId: string) {
    const chatSession = await this.chatSessionModel
      .find({ userId })
      .sort({ timestamp: -1 })
      .exec();
    return chatSession;
  }

  async saveChatSession(chatSession: ChatSessionDocument) {
    return await chatSession.save();
  }

  async queryVector(vector: number[], topK: number, chatSessionID: string) {
    const result = await this.metadataModel.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: vector,
          numCandidates: topK * 5,
          limit: topK,
        },
      },
      {
        $match: { ChatSessionID: chatSessionID },
      },
      {
        $project: {
          text: 1,
          metadata: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);
    const keywordResults = await this.metadataModel.aggregate([
      {
        $search: {
          index: "full_text_search",
          text: {
            query: "Nhiệm vụ 5 findCorrectPassword",
            path: ["text", "metadata.H3"]
          }
        }
      },
      { $limit: topK },
      {
        $project: {
          text: 1,
          metadata: 1,
          score: { $meta: "searchScore" }
        }
      }
    ]);
    const combined = [...result, ...keywordResults];
    combined.sort((a, b) => b.score - a.score);
    console.log("vector search ", combined.slice(0, topK))
    return combined.slice(0, topK);
    return result;
  }

  async embeddings(chunks: string[]) {
    const url = process.env.API_EMBEDDINGS;

    const response = await firstValueFrom(
      this.httpService.post(url, { texts: chunks }),
    );
    return response.data.embeddings;
  }

  async summaryContext(mess: string) {
    const summaryResponse = await this.groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
          Bạn là một trợ lý AI đang tham gia vào một cuộc hội thoại nhiều bước.
          Nhiệm vụ của bạn: TÓM TẮT lại ngữ cảnh hội thoại theo cách giúp trợ lý hiểu được:
          - Người dùng đang làm gì hoặc muốn đạt được điều gì
          - Các chủ đề chính đã được thảo luận
          - Các bước đang thực hiện dở dang (nếu có)
          - Người dùng hiện đang hỏi về phần nào của quy trình
          - Các thông tin quan trọng cần ghi nhớ cho bước tiếp theo.
          Yêu cầu: Ngắn gọn, tập trung vào MỤC ĐÍCH và TIẾN TRÌNH. Không mô tả chi tiết.
          `
        },
        {
          role: "user",
          content: `--- HỘI THOẠI ---\n${mess}\n--- TÓM TẮT NGỮ CẢNH ---`
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.1
    });
    const result = summaryResponse.choices[0].message.content;
    return result;
  }

  async rewriteQuestion(question: string, context: string) {
    const model = await this.groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
          Bạn là chuyên gia tái tạo truy vấn tìm kiếm.
          NHIỆM VỤ:
          Dựa vào Tóm tắt hội thoại, biến câu hỏi hiện tại thành một truy vấn độc lập, rõ nghĩa và tối ưu cho việc truy xuất tài liệu.
          QUY TẮC:
          1. Nếu người dùng hỏi:
            - "tiếp theo"
            - "cái tiếp"
            - "bước tiếp"
            → Chỉ thay thế bằng đúng tên nhiệm vụ tiếp theo nếu Tóm tắt xác định rõ số nhiệm vụ đã hoàn thành.
            → Nếu không xác định rõ số → giữ nguyên câu hỏi.
          2. Không được suy đoán số nhiệm vụ nếu Tóm tắt không nói rõ.
          3. Không được thêm ví dụ từ tài liệu (Sherlock, Watson...) trừ khi người dùng nhắc trực tiếp.
          4. Không thêm các cụm như:
            - "hãy cho tôi biết".
            - "giúp tôi".
            - "theo tài liệu".
            - "trong đề bài".
            - Bất kỳ diễn giải dư thừa nào.
          5. Câu hỏi sau khi tái tạo:
            - Phải độc lập.
            - Phải giữ nguyên ý nghĩa người dùng.
            - Gồm các từ khóa quan trọng và tối ưu cho tìm kiếm bằng embedding vector theo cosine.
          6. Nếu không có lịch sử hội thoại → giữ nguyên câu hỏi.
          7. Chỉ trả về duy nhất truy vấn cuối cùng.
            - Không giải thích.
            - Không thêm văn bản khác.
          `
        },
        {
          role: "user",
          content: `
          Tóm tắt hội thoại: ${context}
          Câu hỏi của người dùng: "${question}"
          Hãy tái tạo lại câu hỏi này:
          `
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1
    });
    const result = model.choices[0].message.content;
    return result;
  }

  async classifyQuestion(question: string, chatSessionID: string) {
    const context = await this.getContext(question, chatSessionID,);
    const model = await this.groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
          Bạn là bộ phân loại intent cho hệ thống AI hỗ trợ sinh viên làm bài tập lớn lập trình.
          - Nhiệm vụ của bạn là phân loại câu hỏi dựa trên:
          1) Nội dung câu hỏi và ngữ cảnh liên quan được trích xuất từ cơ sở dữ liệu (context)
          2) Chỉ trả về DUY NHẤT một JSON object theo format:
          {
            "intent": "GENERAL" | "INFORMATION" | "PROBLEM_SOLVING",
            "level": "EASY" | "MEDIUM" | "HARD" | "NULL",
          }
          - Định nghĩa intent:
            + GENERAL: Không liên quan đến bài tập lớn, hoặc không thể xác định được liên quan do thiếu ngữ cảnh.
            + INFORMATION:
              * Hỏi khái niệm, giải thích, mô tả
              * Yêu cầu tóm tắt, liệt kê, trình bày lại nội dung bài tập lớn
              * Trích xuất thông tin từ tài liệu
              * Không yêu cầu tính toán cụ thể
            + PROBLEM_SOLVING: Tính toán số học, tìm giá trị cụ thể, so sánh số, suy luận dựa trên dữ liệu đầu vào.
          - Định nghĩa level (chỉ áp dụng khi intent = PROBLEM_SOLVING):
            + EASY: Có thể giải quyết câu hỏi từ 1 nửa (50%) context hiện tại. Không cần phải lấy thêm thông tin từ database.
            + MEDIUM: Có thể giải quyết câu hỏi từ toàn bộ context hiện tại. Không cần phải lấy thêm thông tin từ database.
            + HARD: Context hiện tại không đủ để giải quyết cần phải lấy thêm thông tin từ database hoặc cần suy luận phức tạp.
          - Quy tắc:
            + Nếu intent khác PROBLEM_SOLVING → level = "NULL".
            + Nếu không chắc chắn thì level = "MEDIUM".
            + Không giải thích.
            + Không thêm văn bản ngoài JSON.
          `
        },
        {
          role: "user",
          content: `
          Ngữ cảnh liên quan: ${context}
          Câu hỏi của người dùng: "${question}"
          `
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.1
    });
    const result = model.choices[0].message.content;
    return result;
  }

  async getContext(question, chatSessionID, k?) {
    const embeddings = await this.embeddings([question]);
    const vectors = await this.queryVector(embeddings[0], k ?? 16, chatSessionID);
    const text = vectors?.map(vector => vector.text).join(' ');
    return text;
  }

  async general(question: string, context: string) {
    const prompt = `
    Bạn là một trợ lý AI hỗ trợ sinh viên lập trình.
    Nhiệm vụ:
    - Nếu người dùng chào hỏi → trả lời lịch sự, ngắn gọn.
    - Nếu câu hỏi không liên quan đến tài liệu hoặc bài tập lớn → đưa ra thông báo rằng câu hỏi của họ đang ngoài phạm vi để cảnh báo tránh lạc hướng trò chuyện.
    - Không suy diễn thêm thông tin.
    - Trả lời bằng tiếng Việt.
    - Không đề cập đến tài liệu nếu câu hỏi không liên quan.
    --- CÂU HỎI ---
    ${question}
    --- TRẢ LỜI ---
    `;
    return this.callLLM(prompt);
  }

  async information(question: string, context: string, chatSessionID: string) {
    const chunks = await this.getContext(question, chatSessionID, 8);
    const prompt = `
    Bạn là một trợ lý AI chuyên hỗ trợ sinh viên lập trình.
    Nhiệm vụ:
    - Trả lời dựa trên nội dung có trong tài liệu.
    - Chỉ trích xuất và tổng hợp thông tin liên quan đến câu hỏi.
    - Không suy luận vượt quá nội dung đã nêu.
    - Nếu tài liệu không chứa thông tin cần thiết, hãy trả lời rằng không tìm thấy thông tin phù hợp.
    - Không cung cấp code cụ thể.
    - Trả lời bằng tiếng Việt.
    - Trình bày rõ ràng, có cấu trúc nếu cần.
    --- NGỮ CẢNH LIÊN QUAN ĐẾN CÂU HỎI ---
    ${chunks}
    --- NGỮ CẢNH HỘI THOẠI TRƯỚC ĐÓ ĐÃ TÓM TẮT ---
    ${context}
    --- CÂU HỎI ---
    ${question}
    --- TRẢ LỜI ---
    `
    return this.callLLM(prompt);
  }

  async reasoning(question: string, context: string, chatSessionID: string) {
    const chunks = await this.getContext(question, chatSessionID);
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      tools: [{
        functionDeclarations: [{
          name: "getContext",
          description: "Lấy các ngữ cảnh liên quan tới câu hỏi từ cơ sở dữ liệu",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              question: { type: SchemaType.STRING, description: "Câu hỏi hoặc từ khóa cần tìm kiếm" },
              chatSessionID: { type: SchemaType.STRING },
              k: { type: SchemaType.NUMBER, description: "Số lượng chunks muốn lấy, mỗi chunks 2000 token, overlap 400 token" }
            },
            required: ["question", "chatSessionID"]
          }
        }]
      }]
    });
    const max_step = 2
    let memory = ""
    const chat = model.startChat()
    let prompt = `
      Bạn là AI reasoning có thể gọi function getContext.
      LUẬT BẮT BUỘC:
      1. Trước khi quyết định FINAL, phải tự kiểm tra:
        - Đã xác định đầy đủ tất cả biến cần thiết chưa?
        - Đã có công thức rõ ràng trong ngữ cảnh chưa?
        - Có thiếu giới hạn giá trị, quy tắc làm tròn, điều kiện dừng không?
      2. Nếu thiếu bất kỳ thông tin nào để tính chính xác:
        - BẮT BUỘC gọi function getContext.
        - Không được suy đoán.
        - Không được sử dụng kiến thức ngoài ngữ cảnh.
      3. Nếu đã đủ thông tin:
        - Trả lời FINAL.
        - Phải trình bày rõ:
            + Mapping biến
            + Công thức
            + Các bước tính
            + Kết quả
      4. Không được vừa trả lời FINAL vừa gọi function.
      5. Nếu trả lời FINAL:
        - Phải có cảnh báo: "Kết quả có thể sai sót, vui lòng xác thực lại với giảng viên hoặc người phụ trách."
      6. Trả lời bằng tiếng Việt.
      Câu hỏi:
      ${question}
      Ngữ cảnh hiện tại:
      ${chunks}
    `
    let result = await chat.sendMessage(prompt);
    const maxStep = 2;
    for (let i = 0; i < maxStep; i++) {
      const calls = result.response.functionCalls()
      if (!calls || calls.length === 0) {
        memory = result.response.text();
        break
      }
      const toolResponses = [];
      for (const call of calls) {
        console.log("call")
        console.log(call)
        if (call.name === "getContext") {
          const contextData = await this.getContext(call.args["question"], call.args["chatSessionID"]);
          toolResponses.push({
            functionResponse: {
              name: "getContext",
              response: { content: contextData }
            }
          });
        }
      }
      result = await chat.sendMessage(toolResponses);
    }
    console.log(memory)
    return memory;
  }

  async problem_solving(question: string, context: string, chatSessionID: string, k: number = 8) {
    const chunks = await this.getContext(question, chatSessionID, k);
    const prompt = `
    Bạn là một trợ lý AI chuyên giải các bài toán tính toán và suy luận trong bài tập lớn (BTL).
    Nhiệm vụ của bạn:
    - Phân tích NGỮ CẢNH để xác định đúng các biến, công thức và quy tắc.
    - Ánh xạ chính xác dữ liệu người dùng cung cấp vào các biến tương ứng.
    - Thực hiện tính toán đúng theo mô tả trong tài liệu.
    QUY TẮC BẮT BUỘC:
    1. XÁC ĐỊNH BIẾN
    - Nếu đề cho testcase nhiều dòng → ánh xạ từng dòng vào đúng biến theo mô tả input_file.
    - Nếu đề cho các số rời rạc → xác định chúng tương ứng với biến nào trong tài liệu.
    2. KIỂM TRA RÀNG BUỘC
    Trước khi tính:
    - Tìm trong tài liệu:
      + Giới hạn min/max của từng biến
      + Quy tắc làm tròn (nếu có)
      + Điều kiện dừng vòng lặp (nếu có)
    - Nếu giá trị vượt giới hạn → điều chỉnh đúng theo mô tả.
    - Không tự ý làm tròn nếu tài liệu không yêu cầu.
    3. THỰC HIỆN TÍNH TOÁN
    Trình bày rõ theo thứ tự:
    - Mapping biến → giá trị
    - Công thức áp dụng
    - Các bước tính trung gian
    - Kết quả cuối cùng
    4. KHÔNG ĐƯỢC:
    - Không suy đoán thêm công thức ngoài tài liệu
    - Không cung cấp code
    - Không sử dụng các cụm như “Dựa vào ngữ cảnh”
    5. Nếu tài liệu không cung cấp đủ thông tin để tính toán chính xác → trả lời:
    "Không đủ dữ kiện trong tài liệu để xác định kết quả."
    6. Trả lời bằng tiếng Việt.
    ----------------------
    --- NGỮ CẢNH LIÊN QUAN ĐẾN CÂU HỎI ---
    ${chunks}
    --- NGỮ CẢNH HỘI THOẠI TRƯỚC ĐÓ ĐÃ TÓM TẮT ---
    ${context}
    --- CÂU HỎI ---
    ${question}
    --- TRẢ LỜI ---
    Bắt buộc theo bố cục:
    Câu trả lời:
    ...
    Giải thích:
    ...
    Kết luận:
    ...
    `
    return await this.callLLM(prompt);
  }

  async callLLM(prompt: string) {
    console.log("call LLM")
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  async switchIntent(object: { intent: string, question: string, level: string }, context: string, chatSessionID: string) {
    console.log("switch intent")
    switch (object.intent) {
      case "GENERAL":
        return this.general(object.question, context);
      case "INFORMATION":
        return this.information(object.question, context, chatSessionID);
      case "PROBLEM_SOLVING":
        if (object.level === "EASY") {
          console.log("problem solving easy")
          return await this.problem_solving(object.question, context, chatSessionID, 8);
        } else if (object.level === "MEDIUM") {
          console.log("problem solving medium")
          return await this.problem_solving(object.question, context, chatSessionID);
        } else if (object.level === "HARD") {
          console.log("problem solving hard")
          return await this.reasoning(object.question, context, chatSessionID);
        }
      default: return
    }
  }
}
