import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, last } from 'rxjs';
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
import { FunctionCallingMode } from '@google/generative-ai';
import { CacheAnswerDocument, CacheAnswer } from 'src/model/schemas/cacheAnswer.schema';

@Injectable()
export class ChatService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Metadata.name) private metadataModel: Model<MetadataDocument>,
    @InjectModel(ChatSession.name) private chatSessionModel: Model<ChatSessionDocument>,
    @InjectModel(DocumentFile.name) private documentFileModel: Model<DocumentFile>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(CacheAnswer.name) private cacheAnswerModel: Model<CacheAnswerDocument>,
  ) { }

  private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  private groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  async findVictim(courseId: string) {
    const sorts = await this.cacheAnswerModel.find({ courseId }).sort({ hit: 1, lastHitAt: 1 }).exec();
    const victim = sorts[0];
    return victim;
  }

  async addCacheAnswer(courseId: string, question: string, answer: string, summary: string) {
    const check = await this.cacheAnswerModel.find({ courseId }).exec();
    if (check.length >= 30) {
      const victim = await this.findVictim(courseId);
      await this.cacheAnswerModel.findByIdAndDelete(victim._id).exec();
    }
    const embedding = await this.embeddings([question]);
    await new this.cacheAnswerModel({
      courseId,
      question,
      answer,
      summary,
      embedding: embedding[0],
    }).save();
  }

  async updateCacheHit(id: string) {
    const cache = await this.cacheAnswerModel.findById(id).exec();
    if (cache) {
      cache.hit += 1;
      cache.lastHitAt = new Date();
      await cache.save();
    }
  }

  async checkCache(question: string, courseId: string) {
    const check = await this.cacheAnswerModel.find({ courseId }).exec();
    if (check.length === 0) return null;
    const embedding = await this.embeddings([question]);
    const result = await this.cacheAnswerModel.aggregate([
      {
        $vectorSearch: {
          filter: { courseId: courseId },
          index: 'vector_cache',
          path: 'embedding',
          queryVector: embedding[0],
          numCandidates: 200,
          limit: 1,
        },
      },
      {
        $project: {
          _id: 1,
          courseId: 1,
          answer: 1,
          summary: 1,
          lastHitAt: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
      {
        $match: {
          score: { $gte: 0.94 },
        }
      }
    ]);
    console.log('cache check result', result[0]?.score);
    if (result.length > 0) {
      const isStale = await this.documentFileModel.exists({
        courseId: courseId,
        updatedAt: { $gt: result[0].lastHitAt }
      });
      if (isStale) {
        await this.cacheAnswerModel.findByIdAndDelete(result[0]._id);
        return null;
      }
      return result[0];
    }
    return null;
  }

  async getShortTermMess(chatSessionID: string) {
    let shortTermMessages = await this.getMessagesBySession(chatSessionID, 0, 10);
    let shortTermMess = shortTermMessages.map((m) => {
      if (m.type === MessageType.USER) return 'user: ' + m.contextContent;
      else return 'bot: ' + m.summary;
    }).join('\n');
    return shortTermMess;
  }

  async summaryLongTermMess(chatSessionID: string) {
    let longTermMessages = await this.getMessagesBySession(chatSessionID, 11, 20);
    let longTermMess = longTermMessages.map((m) => {
      if (m.type === MessageType.USER) return 'user: ' + m.contextContent;
      else return 'bot: ' + m.summary;
    }).join('\n');
    if (longTermMess.length > 1000) {
      longTermMess = await this.summaryContext(longTermMess);
    }
    return longTermMess;
  }

  async deleteChatSession(chatSessionID: string) {
    const session = await this.chatSessionModel.findById(chatSessionID).exec();
    if (!session) { return false }
    await Promise.all([
      this.chatSessionModel.findByIdAndDelete(chatSessionID).exec(),
      this.messageModel.deleteMany({ sessionId: chatSessionID }).exec(),
    ]);
    return true;
  }

  async createMessage(objs: {
    sessionId: string;
    type: MessageType;
    content: string;
    contextContent?: string;
    summary?: string;
  }) {
    return await new this.messageModel({
      sessionId: objs.sessionId,
      type: objs.type,
      content: objs.content,
      contextContent: objs.contextContent || '',
      summary: objs.summary || '',
    }).save();
  }

  async getMessagesBySession(
    sessionId: string,
    start: number = 0,
    end: number = 0,
  ) {
    const session = await this.chatSessionModel.findById(sessionId).exec();
    if (!session) {
      throw new NotFoundException('Chat session not found');
    }
    let msgs = await this.messageModel
      .find({ sessionId })
      .sort({ createdAt: -1 })
      .skip(start)
      .limit(end)
      .exec();
    return msgs.reverse();
  }

  async create_many(
    objs: {
      courseId: string;
      chunks: number;
      embedding: number[];
      text: string;
      fileId: string;
    }[],
  ) {
    return this.metadataModel.insertMany(objs);
  }

  async create_documentFile(objs: {
    courseId: string;
    filename: string;
    url: string;
    mimetype: string;
    size: number;
    userId: string;
    // sessionId?: string;
  }) {
    return await new this.documentFileModel({
      courseId: objs.courseId,
      filename: objs.filename,
      url: objs.url,
      mimetype: objs.mimetype,
      size: objs.size,
      userId: objs.userId,
      // sessionId: objs.sessionId,
    }).save();
  }

  async findOne(id: string) {
    return await this.chatSessionModel.findById(id).exec();
  }

  async create(objs: { userID: any; courseId: string; title: string }) {
    return await new this.chatSessionModel({
      courseId: objs.courseId,
      userId: objs.userID,
      title: objs.title,
    }).save();
  }

  async createChatSession(
    firstMessage: string,
    courseId: string,
    userId: string,
  ) {
    const title = await generateTitleFromAI(firstMessage);
    return await this.create({ userID: userId, courseId: courseId, title });
  }

  async getChatSession(userId: string) {
    const chatSession = await this.chatSessionModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'courseId',
        model: 'Course',
        select: 'name',
      })
      .exec();

    return chatSession;
  }

  async getChatSessionByID(id: string) {
    return await this.chatSessionModel
      .findById(id)
      .populate({ path: 'courseId', model: 'Course', select: 'name' })
      .exec();
  }

  async saveChatSession(chatSession: ChatSessionDocument) {
    return await chatSession.save();
  }

  async queryVector(vector: number[], topK: number, courseId: string) {
    const result = await this.metadataModel.aggregate([
      {
        $vectorSearch: {
          filter: {
            courseId: courseId,
          },
          index: 'vector_index',
          path: 'embedding',
          queryVector: vector,
          numCandidates: topK * 5,
          limit: topK,
        },
      },
      {
        $project: {
          _id: 1,
          text: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ]);
    return result;
  }

  async queryKeyword(keyword: string, courseId: string, topK: number) {
    const keywordResults = await this.metadataModel.aggregate([
      {
        $search: {
          index: 'full_text_search',
          compound: {
            must: [
              {
                text: {
                  query: keyword,
                  path: ['text', 'metadata.H3'],
                },
              },
            ],
            filter: [{ equals: { path: 'courseId', value: courseId } }],
          },
        },
      },
      { $limit: topK },
      {
        $project: {
          _id: 1,
          text: 1,
          score: { $meta: 'searchScore' },
        },
      },
    ]);
    return keywordResults;
  }

  async combineChunks(
    arr1: { _id: any; text: string; score: number }[],
    arr2: { _id: any; text: string; score: number }[],
    topK: number,
  ) {
    const map = new Map();
    arr1.forEach((item, index) => {
      map.set(item._id.toString(), {
        text: item.text,
        score: 1 / (index + 1 + 60),
      });
    });
    arr2.forEach((item, index) => {
      if (!map.has(item._id.toString())) {
        map.set(item._id.toString(), {
          text: item.text,
          score: 1 / (index + 1 + 60),
        });
      } else {
        map.get(item._id.toString()).score += 1 / (index + 1 + 60);
      }
    });
    const merged = Array.from(map.values());
    merged.sort((a, b) => b.score - a.score);
    return merged.slice(0, topK);
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
          role: 'system',
          content: `
          Bạn là một trợ lý AI đang tham gia vào một cuộc hội thoại nhiều bước.
          Nhiệm vụ của bạn: TÓM TẮT lại ngữ cảnh hội thoại theo cách giúp trợ lý hiểu được:
          - Người dùng đang làm gì hoặc muốn đạt được điều gì
          - Các chủ đề chính đã được thảo luận
          - Các bước đang thực hiện dở dang (nếu có)
          - Người dùng hiện đang hỏi về phần nào của quy trình
          - Các thông tin quan trọng cần ghi nhớ cho bước tiếp theo.
          - Tối đa 1000 từ.
          Yêu cầu: Ngắn gọn, tập trung vào MỤC ĐÍCH và TIẾN TRÌNH. Không mô tả chi tiết.
          `,
        },
        {
          role: 'user',
          content: `--- HỘI THOẠI ---\n${mess}\n--- TÓM TẮT NGỮ CẢNH ---`,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
    });
    const result = summaryResponse.choices[0].message.content;
    return result;
  }

  async rewriteQuestion(question: string, context: string) {
    const model = await this.groq.chat.completions.create({
      messages: [
        {
          role: 'system',
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
          `,
        },
        {
          role: 'user',
          content: `
          Tóm tắt hội thoại: ${context}
          Câu hỏi của người dùng: "${question}"
          Hãy tái tạo lại câu hỏi này:
          `,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
    });
    const result = model.choices[0].message.content;
    return result;

    // const model = this.genAI.getGenerativeModel({
    //   model: 'gemini-2.5-flash-lite',
    // });
    // let newPrompt = `
    //   Bạn là chuyên gia tái tạo truy vấn tìm kiếm. NHIỆM VỤ:
    //   Dựa vào Tóm tắt hội thoại, biến câu hỏi hiện tại thành một truy vấn độc lập, rõ nghĩa và tối ưu cho việc truy xuất tài liệu.
    //   QUY TẮC:
    //   1. Nếu người dùng hỏi:
    //     - "tiếp theo"
    //     - "cái tiếp"
    //     - "bước tiếp"
    //     → Chỉ thay thế bằng đúng tên nhiệm vụ tiếp theo nếu Tóm tắt xác định rõ số nhiệm vụ đã hoàn thành.
    //     → Nếu không xác định rõ số → giữ nguyên câu hỏi.
    //   2. Không được suy đoán số nhiệm vụ nếu Tóm tắt không nói rõ.
    //   3. Không được thêm ví dụ từ tài liệu (Sherlock, Watson...) trừ khi người dùng nhắc trực tiếp.
    //   4. Không thêm các cụm như:
    //     - "hãy cho tôi biết".
    //     - "giúp tôi".
    //     - "theo tài liệu".
    //     - "trong đề bài".
    //     - Bất kỳ diễn giải dư thừa nào.
    //   5. Câu hỏi sau khi tái tạo:
    //     - Phải độc lập.
    //     - Phải giữ nguyên ý nghĩa người dùng.
    //     - Gồm các từ khóa quan trọng và tối ưu cho tìm kiếm bằng embedding vector theo cosine.
    //   6. Nếu không có lịch sử hội thoại → giữ nguyên câu hỏi.
    //   7. Chỉ trả về duy nhất truy vấn cuối cùng.
    //     - Không giải thích.
    //     - Không thêm văn bản khác.
    //   Tóm tắt hội thoại: ${context}
    //   Câu hỏi của người dùng: "${question}"
    // `;
    // const result = await model.generateContent(newPrompt);
    // return result.response.text();
  }

  async classifyQuestion(question: string, courseId: string, retries: number = 3, delay: number = 1000) {
    // const context = await this.getContext(question, courseId);
    // const model = await this.groq.chat.completions.create({
    //   messages: [
    //     {
    //       role: 'system',
    //       content: `
    //       Bạn là bộ phân loại intent cho hệ thống AI hỗ trợ sinh viên làm bài tập lớn lập trình.
    //       - Nhiệm vụ của bạn là phân loại câu hỏi dựa trên:
    //       1) Nội dung câu hỏi và ngữ cảnh liên quan được trích xuất từ cơ sở dữ liệu (context)
    //       2) Chỉ trả về DUY NHẤT một JSON object theo format:
    //       {
    //         "intent": "GENERAL" | "INFORMATION" | "PROBLEM_SOLVING",
    //         "level": "EASY" | "MEDIUM" | "HARD" | "NULL",
    //       }
    //       - Định nghĩa intent:
    //         + GENERAL: Không liên quan đến bài tập lớn, hoặc không thể xác định được liên quan do thiếu ngữ cảnh.
    //         + INFORMATION:
    //           * Hỏi khái niệm, giải thích, mô tả
    //           * Yêu cầu tóm tắt, liệt kê, trình bày lại nội dung bài tập lớn
    //           * Trích xuất thông tin từ tài liệu
    //           * Không yêu cầu tính toán cụ thể
    //         + PROBLEM_SOLVING: Tính toán số học, tìm giá trị cụ thể, so sánh số, suy luận dựa trên dữ liệu đầu vào.
    //       - Định nghĩa level (chỉ áp dụng khi intent = PROBLEM_SOLVING):
    //         + EASY: Có thể giải quyết câu hỏi từ 1 nửa (50%) context hiện tại. Không cần phải lấy thêm thông tin từ database.
    //         + MEDIUM: Có thể giải quyết câu hỏi từ toàn bộ context hiện tại. Không cần phải lấy thêm thông tin từ database.
    //         + HARD: Context hiện tại không đủ để giải quyết cần phải lấy thêm thông tin từ database hoặc cần suy luận phức tạp.
    //       - Quy tắc:
    //         + Nếu intent khác PROBLEM_SOLVING → level = "NULL".
    //         + Nếu không chắc chắn thì level = "MEDIUM".
    //         + Không giải thích.
    //         + Không thêm văn bản ngoài JSON.
    //       `,
    //     },
    //     {
    //       role: 'user',
    //       content: `
    //       Ngữ cảnh liên quan: ${context}
    //       Câu hỏi của người dùng: "${question}"
    //       `,
    //     },
    //   ],
    //   model: 'llama-3.3-70b-versatile',
    //   response_format: { type: 'json_object' },
    //   temperature: 0.1,
    // });
    // const result = model.choices[0].message.content;
    // return JSON.parse(result);

    try {
      const context = await this.getContext(question, courseId);
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
        systemInstruction: `
        Bạn là bộ phân loại intent cho hệ thống AI hỗ trợ sinh viên làm bài tập lớn lập trình.
        - GIÁ TRỊ HỢP LỆ CHO 'intent':
          + GENERAL: Chào hỏi, câu hỏi ngoài lề bài tập lớn.
          + INFORMATION: Truy xuất thông tin, giải thích khái niệm, tóm tắt, không tính toán.
          + PROBLEM_SOLVING: Yêu cầu tính toán, suy luận số liệu, so sánh, tìm kết quả cụ thể.
        - GIÁ TRỊ HỢP LỆ CHO 'level':
          + NULL: Dùng khi 'intent' là GENERAL hoặc INFORMATION, khi 'intent' là 'PROBLEM_SOLVING' mới thực hiện phân loại.
          + EASY: Chỉ cần khoảng 1/2 ngữ cảnh (context) hiện tại là giải được.
          + MEDIUM: Cần toàn bộ ngữ cảnh hiện tại để xử lý. 
          + HARD: Ngữ cảnh hiện tại không đủ, cần suy luận nhiều bước hoặc gọi hàm lấy thêm dữ liệu.
        RÀNG BUỘC: 
          1. Chỉ trả về JSON, không giải thích.
          2. Giá trị 'intent' và 'level' phải viết HOA và nằm trong danh sách hợp lệ trên.
        `,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              intent: { type: SchemaType.STRING },
              level: { type: SchemaType.STRING },
            },
            required: ['intent', 'level'],
          },
          temperature: 0.1,
        },
      });
      const prompt = `
      Ngữ cảnh (Context): ${context}
      Câu hỏi người dùng: ${question}
    `;
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      return JSON.parse(result.response.text());
    } catch (error: any) {
      if (error.status == 503 && retries > 0) {
        console.warn(`Server lag, đang thử lại sau ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
        return this.classifyQuestion(question, courseId, retries - 1, delay * 2);
      }
    }
  }

  async getContext(question, courseId, k: number = 8) {
    const embeddings = await this.embeddings([question]);
    const keywordResults = await this.queryKeyword(question, courseId, k);
    const vectorResults = await this.queryVector(embeddings[0], k, courseId);
    const chunks = await this.combineChunks(keywordResults, vectorResults, k);
    const text = chunks?.map((chunk) => chunk.text).join(' ');
    return text;
  }

  async getVector(question, courseId, k: number = 8) {
    const keywordResults = await this.queryKeyword(question, courseId, k);
    return keywordResults
  }

  async general(question: string, context: string) {
    const conversationHistory =
      context && context.trim() !== ''
        ? context
        : 'Không có lịch sử hội thoại trước đó.';
    const prompt = `
    Bạn là một trợ lý AI hỗ trợ sinh viên lập trình.
    Nhiệm vụ:
    - Nếu người dùng chào hỏi → trả lời lịch sự, ngắn gọn.
    - Nếu câu hỏi không liên quan đến tài liệu hoặc bài tập lớn → đưa ra thông báo rằng câu hỏi của họ đang ngoài phạm vi để cảnh báo tránh lạc hướng trò chuyện.
    - Không suy diễn thêm thông tin.
    - Trả lời bằng tiếng Việt.
    - Không đề cập đến tài liệu nếu câu hỏi không liên quan.
    QUY TẮC BẮT BUỘC:
    1. Trả lời bằng tiếng Việt.
    2. Trả lời Tối đa 200 từ (biến answer).
    3. SUMMARY (biến summary):
    - Tóm tắt nội dung chính của câu trả lời, không bao gồm câu hỏi.
    - Tối đa 50 từ.
    --- CÂU HỎI ---
    ${question}
    --- LỊCH SỬ HỘI THOẠI ---
    ${conversationHistory}
    `;
    return this.callLLM(prompt);
  }

  async information(question: string, context: string, courseId: string) {
    const chunks = await this.getContext(question, courseId, 12);
    const conversationHistory =
      context && context.trim() !== ''
        ? context
        : 'Không có lịch sử hội thoại trước đó.';
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
    QUY TẮC BẮT BUỘC:
    1. Trả lời bằng tiếng Việt.
    2. Trả lời Tối đa 500 từ (biến answer).
    3. SUMMARY (biến summary):
    - Tóm tắt nội dung chính của câu trả lời, không bao gồm câu hỏi.
    - Tối đa 200 từ.
    --- NGỮ CẢNH LIÊN QUAN ĐẾN CÂU HỎI ---
    ${chunks}
    --- LỊCH SỬ HỘI THOẠI TRƯỚC ĐÓ ---
    ${conversationHistory}
    --- CÂU HỎI ---
    ${question}
    `;
    return this.callLLM(prompt);
  }

  async reasoning(question: string, context: string, courseId: string) {
    const chunks = await this.getContext(question, courseId);
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `
        Bạn là một hệ thống AI chuyên dụng, chỉ được phép giao tiếp thông qua việc gọi hàm.
        BẮT BUỘC TUÂN THỦ:
        1. KHÔNG trả về văn bản thuần túy (string).
        2. Mỗi lượt phản hồi CHỈ ĐƯỢC gọi đúng 1 hàm.
        3. Nếu cần thêm thông tin từ cơ sở dữ liệu -> gọi getContext.
        4. Nếu đã có câu trả lời -> gọi finalAnswer.
        5. Khi gọi finalAnswer:
          - answer: trả lời đầy đủ (≤ 500 từ)
          - PHẢI có dòng: "Kết quả có thể sai sót, vui lòng xác thực lại với giảng viên hoặc người phụ trách."
          - summary: tóm tắt (≤ 200 từ)
        6. Tuyệt đối không giải thích, không cung cấp code giải bài.
        7. Bạn phải gọi một function ngay bây giờ.
      `,
      tools: [
        {
          functionDeclarations: [
            {
              name: 'getContext',
              description:
                'Lấy các ngữ cảnh liên quan tới câu hỏi từ cơ sở dữ liệu',
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  question: {
                    type: SchemaType.STRING,
                    description: 'Câu hỏi hoặc từ khóa cần tìm kiếm',
                  },
                  courseId: { type: SchemaType.STRING },
                  k: {
                    type: SchemaType.NUMBER,
                    description:
                      'Số lượng chunks muốn lấy, mỗi chunks 2000 token, overlap 400 token',
                  },
                },
                required: ['question', 'courseId'],
              },
            },
            {
              name: 'finalAnswer',
              description: 'Gọi hàm này khi muốn đưa về câu trả lời cuối cùng',
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  answer: { type: SchemaType.STRING, description: 'Câu trả lời <= 500 ký tự', },
                  summary: { type: SchemaType.STRING, description: 'Câu trả lời tóm tắt <= 200 ký tự' },
                },
                required: ['answer', 'summary'],
              },
            },
          ],
        },
      ],
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingMode.ANY,
        },
      },
    });
    const max_step = 2;
    let memory = '';
    const chat = model.startChat();
    const conversationHistory =
      context && context.trim() !== ''
        ? context
        : 'Không có lịch sử hội thoại trước đó.';
    let prompt = `INPUT: CÂU HỎI: ${question}\nNGỮ CẢNH HIỆN TẠI: ${chunks}\nLỊCH SỬ: ${conversationHistory}\ncourseId: ${courseId}`;
    // Bạn là AI bắt buộc phải sử dụng function để trả lời.
    // Bạn có 2 function:
    // - getContext(question, courseId, k): dùng khi thiếu dữ liệu
    // - finalAnswer(answer, summary): dùng khi đã đưa ra câu trả lời cuối cùng
    // QUY TẮC:
    // 1. Bạn PHẢI gọi đúng 1 function trong mỗi lần phản hồi:
    //   - Thiếu dữ liệu → gọi getContext
    //   - Đủ dữ liệu → gọi finalAnswer
    // 2. Không bao giờ được:
    //   - Trả về text bình thường
    //   - Giải thích ngoài function
    //   - Gọi nhiều hơn 1 function
    //   - Cung cấp code giải bài cho người hỏi
    // 3. Không được suy đoán:
    //   - Nếu thiếu bất kỳ biến, giá trị, hoặc thông tin → phải gọi getContext
    // 4. Khi gọi finalAnswer:
    //   - answer: trả lời đầy đủ (≤ 500 từ)
    //   - PHẢI có dòng:
    //     "Kết quả có thể sai sót, vui lòng xác thực lại với giảng viên hoặc người phụ trách."
    //   - summary: tóm tắt (≤ 100 từ)
    // 5. Ưu tiên:
    //   - Sử dụng dữ liệu từ Ngữ cảnh và Lịch sử
    //   - Nếu không tìm thấy → gọi getContext
    // BẮT BUỘC: Bạn phải gọi một function ngay bây giờ.
    let result = await chat.sendMessage(prompt);
    const maxStep = 2;
    for (let i = 0; i < maxStep; i++) {
      const calls = result.response.functionCalls();
      if (!calls || calls.length === 0) {
        memory = result.response.text();
        break;
      }
      const toolResponses = [];
      for (const call of calls) {
        if (call.name === 'getContext') {
          console.log('getContext');
          const contextData = await this.getContext(
            call.args['question'],
            call.args['courseId'],
          );
          toolResponses.push({
            functionResponse: {
              name: 'getContext',
              response: { content: contextData },
            },
          });
        } else if (call.name === 'finalAnswer') {
          console.log('finalAnswer');
          return {
            answer: call.args['answer'],
            summary: call.args['summary'],
          };
        }
      }
      result = await chat.sendMessage(toolResponses);
    }

    return memory;
  }

  async problem_solving(
    question: string,
    context: string,
    courseId: string,
    k: number = 8,
  ) {
    const chunks = await this.getContext(question, courseId, k);
    const conversationHistory =
      context && context.trim() !== ''
        ? context
        : 'Không có lịch sử hội thoại trước đó.';
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
      + Giới hạn của biến
      + Quy tắc tinh toán
      + Điều kiện tính toán
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
    - Tuyệt đối không cung cấp code vào câu trả lời cho dù câu hỏi có yêu cầu.
    - Không sử dụng các cụm như “Dựa vào ngữ cảnh”
    5. Nếu tài liệu không cung cấp đủ thông tin để tính toán chính xác → trả lời:
    "Không đủ dữ kiện trong tài liệu để xác định kết quả."
    6. Trả lời bằng tiếng Việt.
    7. TRẢ LỜI (biến answer)
    - Có gợi ý cho câu hỏi tiếp theo.
    - Tối đa 500 từ.
    8. SUMMARY (biến summary)
    - Tóm tắt nội dung chính của câu trả lời.
    - Tối đa 200 từ.
    ----------------------
    --- NGỮ CẢNH LIÊN QUAN ĐẾN CÂU HỎI ---
    ${chunks}
    --- LỊCH SỬ HỘI THOẠI TRƯỚC ĐÓ ---
    ${conversationHistory}
    --- CÂU HỎI ---
    ${question}
    `;
    return await this.callLLM(prompt);
  }

  async callLLM(prompt: string, retries: number = 3, delay: number = 1000) {
    try {
      console.log('call LLM');
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: `
        BẠN LÀ: Một người bạn cộng sự thông minh, hỗ trợ giải quyết Bài Tập Lớn của trường Đại học Bách Khoa TP. HCM.
        PHONG CÁCH: 
        - Thân thiện, xưng hô "mình - bạn". 
        - Khi người dùng tính toán sai, hãy nhẹ nhàng chỉ ra lỗi (ví dụ: "Hình như bạn nhầm công thức ở bước... rồi nè") trước khi đưa ra đáp án đúng.
        QUY TẮC ĐỊNH DẠNG:
        - KHÔNG sử dụng các thẻ HTML (<ul>, <li>, <br>...).
        - CHỈ sử dụng Markdown (dấu * hoặc - cho danh sách, ** cho chữ đậm).
      `,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              answer: { type: SchemaType.STRING },
              summary: { type: SchemaType.STRING },
            },
            required: ['answer', 'summary'],
          },
        },
      });
      const result = await model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch (error: any) {
      if (error.status === 503 && retries > 0) {
        console.warn(`Server lag, đang thử lại sau ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
        return this.callLLM(prompt, retries - 1, delay * 2);
      } else {

      }
    }
  }

  async switchIntent(
    object: { intent: string; question: string; level: string },
    context: string,
    courseId: string,
  ) {
    console.log('switch intent');
    switch (object.intent) {
      case 'GENERAL':
        return this.general(object.question, context);
      case 'INFORMATION':
        return this.information(object.question, context, courseId);
      case 'PROBLEM_SOLVING':
        if (object.level === 'EASY') {
          console.log('problem solving easy');
          return await this.problem_solving(
            object.question,
            context,
            courseId,
            8,
          );
        } else if (object.level === 'MEDIUM') {
          console.log('problem solving medium');
          return await this.problem_solving(
            object.question,
            context,
            courseId,
            16,
          );
        } else if (object.level === 'HARD') {
          console.log('problem solving hard');
          return await this.reasoning(object.question, context, courseId);
        }
      default:
        return;
    }
  }
}
