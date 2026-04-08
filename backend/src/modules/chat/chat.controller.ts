import { ChatSessionSchema } from 'src/model/schemas/chatSession.schema';
// import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatService } from './chat.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateQuestionDto } from 'src/model/dtos/chat/createQuestion.dto';
import FormData from 'form-data';
import axios from 'axios';
import { MessageType } from 'src/interface/type';
import { CreateChatSessionDto } from 'src/model/dtos/chat/createChatSession.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthJwtGuard } from '../guards/jwt.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Post('semantic-chunk')
  @UseInterceptors(FileInterceptor('file'))
  async semanticChunk(
    @Body() body: { userID: any; courseId: any },
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log(file)
    if (file) {
      const documentFile = await this.chatService.create_documentFile({
        courseId: body.courseId,
        filename: file.originalname,
        url: '',
        mimetype: file.mimetype,
        size: file.size,
        userId: body.userID,
      });
      console.log("run here");
      const form = new FormData();
      form.append('file', file.buffer, file.originalname);
      const response = await axios.post(process.env.API_HANDLE_FILE, form, {
        headers: form.getHeaders(),
      });
      const data = response.data.map((item: any) => ({
        ...item,
        courseId: body.courseId,
        fileId: documentFile._id.toString(),
      }));
      await this.chatService.create_many(data);
    }
    return { message: 'File uploaded successfully' };
  }

  @UseGuards(AuthJwtGuard)
  @Post('create')
  async createChatSession(
    @Body() createChatSessionDto: CreateChatSessionDto,
    @Req() req,
  ) {
    if (!req.user) throw new Error('User not found');
    const chatSession = await this.chatService.createChatSession(
      createChatSessionDto.firstMessage,
      createChatSessionDto.courseId,
      req.user,
    );
    return {
      message: 'Chat session created successfully',
      data: chatSession,
    };
  }

  @UseGuards(AuthJwtGuard)
  @Get('get-chat-sessions')
  async getChatSession(@Req() req) {
    if (!req.user) throw new Error('User not found');
    const chatSession = await this.chatService.getChatSession(req.user);
    return {
      message: 'Chat session get successfully',
      data: chatSession,
    };
  }

  @UseGuards(AuthJwtGuard)
  @Get('get-session-by-id/:chatSessionID')
  async getChatSessionByID(@Param('chatSessionID') chatSessionID: string) {
    const chatSession = await this.chatService.getChatSessionByID(chatSessionID);
    return {
      message: 'Chat session get successfully',
      data: chatSession,
    };
  }

  @UseGuards(AuthJwtGuard)
  @Get('get-messages/:chatSessionID')
  async getMessages(@Param('chatSessionID') chatSessionID: string) {
    const messages = await this.chatService.getMessagesBySession(chatSessionID);
    return {
      message: 'Messages get successfully',
      data: messages,
    };
  }

  @UseGuards(AuthJwtGuard)
  @Post('/question')
  async getAnswer(@Body() createQuestion: CreateQuestionDto, @Req() req) {
    try {
      let chatSessionID = createQuestion.chatSessionID
        ? createQuestion.chatSessionID
        : (await this.chatService.createChatSession(createQuestion.question, createQuestion.courseId, req.user,))._id.toString();
      let shortTermMess = await this.chatService.getShortTermMess(chatSessionID);
      let question = createQuestion.question
      if (shortTermMess) question = await this.chatService.rewriteQuestion(createQuestion.question, shortTermMess);
      let intent = await this.chatService.classifyQuestion(question, createQuestion.courseId);
      intent = JSON.parse(intent);
      console.log(intent);
      let hit = null;
      if (intent['intent'] !== 'PROBLEM_SOLVING') hit = await this.chatService.checkCache(question, createQuestion.courseId);
      let answer = {
        answer: '',
        summary: '',
      };
      if (hit) {
        answer = {
          answer: hit.answer,
          summary: hit.summary,
        }
        await this.chatService.updateCacheHit(hit._id);
      } else {
        let longTermMess = await this.chatService.summaryLongTermMess(chatSessionID);
        let history = `10 tin nhắn gần nhất: ${shortTermMess}\nNgữ cảnh 10 tin nhắn tiếp theo đã tóm tắt: ${longTermMess}`;
        answer = await this.chatService.switchIntent({ intent: intent['intent'], question, level: intent['level'] }, history, createQuestion.courseId);
        console.log('answer');
        console.log(typeof answer);
        await this.chatService.addCacheAnswer(createQuestion.courseId, question, answer.answer, answer.summary);
      }
      await this.chatService.createMessage({
        sessionId: chatSessionID,
        type: MessageType.USER,
        content: createQuestion.question,
        contextContent: question,
      });
      await this.chatService.createMessage({
        sessionId: chatSessionID,
        type: MessageType.ASSISTANT,
        content: answer.answer,
        contextContent: '',
        summary: answer.summary,
      });
      return {
        message: 'success',
        answer: answer.answer,
        chatSessionID,
      };
    } catch (error) {
      console.error(error);
      return {
        message: 'An error occurred while processing your question.',
        error: error,
      };
    }
    // const prompt = `
    //   Bạn là một trợ lý AI chuyên giúp sinh viên lập trình và giải thích bài tập lớn (BTL).
    //   Nhiệm vụ của bạn là dựa vào NGỮ CẢNH (các đoạn trích từ tài liệu) để trả lời CÂU HỎI.
    //   Hãy tuân theo quy tắc sau:

    //   1. Ngữ cảnh có thể chứa mô tả về cấu trúc file đầu vào (input_file), ví dụ như:
    //     - Các dòng đầu có dạng: C1 C2
    //     - Các dòng tiếp theo có dạng: L1 L2
    //     => Nghĩa là dòng thứ nhất trong testcase tương ứng với HP1, HP2, và dòng thứ hai tương ứng với L1, L2.

    //   2. Khi người dùng đưa vào một testcase (dưới dạng nhiều dòng số), trước tiên hãy ánh xạ từng dòng trong testcase với các biến đã mô tả trong ngữ cảnh, rồi áp dụng công thức hoặc ví dụ trong ngữ cảnh để tính kết quả đầu ra chính xác.
    //   3. Có thể người dùng sẽ không đưa ra testcase, mà sẽ đưa ra các số liệu riêng lẻ. Trong trường hợp này, hãy xác định biến nào tương ứng với số liệu đó dựa trên ngữ cảnh, sau đó áp dụng công thức hoặc quy tắc đã mô tả để tính toán kết quả.
    //   4. Trước khi bắt đầu tính toán, hãy tìm trong tài liệu các đoạn nói về:
    //     - giới hạn giá trị của các giá trị (kể cả giá trị đầu vào cũng phải nằm trong giới hạn này, nếu giá trị đầu vào vượt giới hạn hãy đưa về giá trị phù hợp theo ngữ cảnh).
    //     - cách làm tròn. (không tự ý làm tròn các biến không được đề cập về quy định làm tròn)
    //     - điều kiện dừng vòng lặp.
    //     => Sau đó áp dụng các quy tắc đó cho bài toán này. Nếu tài liệu không quy định, hãy dùng quy tắc toán học thông thường.

    //   5. Nếu ngữ cảnh có thông tin liên quan, hãy trả lời rõ ràng, có cấu trúc (bullet points, đoạn).
    //   6. Không cung cấp code cụ thể và các đoạn mã giải bài tập cụ thể cho dù có được yêu cầu.
    //   7. Trả lời bằng tiếng Việt.
    //   8. Không sử dụng các cụm như “Dựa vào ngữ cảnh” hay “Dựa trên thông tin bạn cung cấp”.
    //   9. Nếu có yêu cầu tính toán, hãy trình bày quá trình suy luận (mapping biến → giá trị → công thức → kết quả).
    //   10. Tách câu trả lời theo bố cục: Câu trả lời - Giải thích - Kết luận
  }

  @Delete('/deleteChatSession')
  async deleteChatSession(@Body() body: { chatSessionID: string }) {
    const deletedSession = await this.chatService.deleteChatSession(body.chatSessionID);
    if (!deletedSession) {
      return {
        message: 'ChatSession not found',
      };
    }
    return {
      message: 'ChatSession deleted successfully',
    };
  }
}
