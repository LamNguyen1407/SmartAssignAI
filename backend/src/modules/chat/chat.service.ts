import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Metadata, MetadataDocument } from 'src/model/schemas/metadata.schema';
import { ChatSession, ChatSessionDocument } from 'src/model/schemas/chatSession.schema';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateTitleFromAI } from 'src/utils/generateTitle';
import { DocumentFile } from 'src/model/schemas/document.schema';
import { Message, MessageDocument } from 'src/model/schemas/message.schema';
import { MessageType } from 'src/interface/type';

@Injectable()
export class ChatService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Metadata.name) private metadataModel: Model<MetadataDocument>,
    @InjectModel(ChatSession.name) private chatSessionModel: Model<ChatSessionDocument>,
    @InjectModel(DocumentFile.name) private documentFileModel: Model<DocumentFile>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) { }

  private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  async createMessage(objs: { sessionId: string; type: MessageType; content: string }) {
    return await new this.messageModel({
      sessionId: objs.sessionId,
      type: objs.type,
      content: objs.content,
    }).save();
  }

  async getMessagesBySession(sessionId: string, num: number = 10) {
    return await this.messageModel.find({ sessionId }).sort({ createdAt: -1 }).limit(num).exec();
  }

  async create_many(objs: { chunks: number; embedding: number[]; text: string; fileId: string }[]) {
    return this.metadataModel.insertMany(objs);
  }

  async create_documentFile(objs: { filename: string; url: string; mimetype: string; size: number; userId: string; sessionId?: string }) {
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

  async create(objs: { userID: any, title: string }) {
    return await new this.chatSessionModel({
      userId: objs.userID,
      title: objs.title,
      timestamp: new Date(),
    }).save();
  }

  async createChatSession(firstMessage: string, userId: string) {
    const title = await generateTitleFromAI(firstMessage);
    return await this.create({ userID: userId, title });
  }

  async getChatSession(userId: string) {
    const chatSession = await this.chatSessionModel.find({ userId }).sort({ timestamp: -1 }).exec();
    return chatSession;
  }

  async saveChatSession(chatSession: ChatSessionDocument) {
    return await chatSession.save();
  }

  async askAI(prompt: string) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
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
        }
      },
      {
        $match: { ChatSessionID: chatSessionID }
      }
    ]);
    return result;
  }

  async embeddings(chunks: string[]) {
    const url = process.env.API_EMBEDDINGS;

    const response = await firstValueFrom(this.httpService.post(url, { texts: chunks }));
    return response.data.embeddings;
  }

  // findAll() {
  //   return `This action returns all chat`;
  // }

  // update(id: number, updateChatDto: UpdateChatDto) {
  //   return `This action updates a #${id} chat`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} chat`;
  // }
}
