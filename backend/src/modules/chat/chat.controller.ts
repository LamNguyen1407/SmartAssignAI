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
import * as FormData from 'form-data';
import axios from 'axios';
import { MessageType } from 'src/interface/type';
import { CreateChatSessionDto } from 'src/model/dtos/chat/createChatSession.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthJwtGuard } from '../guards/jwt.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // upload:
  // + nhận file? + userID + chatSessionID? từ frontend
  // + nếu có chatSessionID thì lấy chatSession ra từ DB
  // + nếu không có chatSessionID thì tạo mới chatSession và lưu vào DB
  // + nếu có file thì gọi api xử lý file, nhận về metadata, lưu indexMetadata vào chatSession.indexMetadatas
  // + nếu không có file thì bỏ qua bước xử lý file
  // + thông báo lưu thành công về frontend
  @Post('semantic-chunk')
  @UseInterceptors(FileInterceptor('file'))
  async semanticChunk(
    @Body() body: { userID: any; chatSessionID?: any },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      let chatSession = null;
      if (body.chatSessionID) {
        chatSession = await this.chatService.findOne(body.chatSessionID);
      } else {
        chatSession = await this.chatService.create({
          userID: body.userID,
          title: file?.originalname,
        });
      }
      if (file) {
        const documentFile = await this.chatService.create_documentFile({
          filename: file.originalname,
          url: '',
          mimetype: file.mimetype,
          size: file.size,
          userId: body.userID,
          sessionId: chatSession._id.toString(),
        });
        const form = new FormData();
        form.append('file', file.buffer, file.originalname);
        const respone = await axios.post(process.env.API_HANDLE_FILE, form, {
          headers: form.getHeaders(),
        });
        const data = respone.data.map((item: any) => ({
          ...item,
          ChatSessionID: chatSession._id.toString(),
          fileId: documentFile._id.toString(),
        }));
        await this.chatService.create_many(data);
      }
      return { message: 'File uploaded successfully' };
    } catch (error) {
      return { message: 'File upload failed', error: error.message };
    }
  }

  @UseGuards(AuthJwtGuard)
  @Post('create')
  async createChatSession(
    @Body() createChatSessionDto: CreateChatSessionDto,
    @Req() req,
  ) {
    try {
      if (!req.user) throw new Error('User not found');
      const chatSession = await this.chatService.createChatSession(
        createChatSessionDto.firstMessage,
        req.user,
      );
      return {
        message: 'Chat session created successfully',
        data: chatSession,
      };
    } catch (error) {
      return { message: 'Chat session creation failed', error: error.message };
    }
  }

  @UseGuards(AuthJwtGuard)
  @Get('get-chat-sessions')
  async getChatSession(@Req() req) {
    try {
      if (!req.user) throw new Error('User not found');
      const chatSession = await this.chatService.getChatSession(req.user);
      return {
        message: 'Chat session get successfully',
        data: chatSession,
      };
    } catch (error) {
      console.log(error);
      throw new Error('Chat session get failed');
    }
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

  // answer:
  // + backend nhận (chatSessionID + question)
  // + lấy ra được 10 message gần nhất từ chatSessionID
  // + tóm tắt 10 tin nhắn gần nhất để lấy context
  // + tạo embbeding từ (context + question)
  // + metadata thực hiện lấy ra k chunk phù hợp với embbeding
  // + gửi k chunk và context 10 message cuối vào và question LLM để lấy câu trả lời
  // + thêm câu hỏi và trả lời vào message trong Message
  // + trả câu trả lời về frontend
  @UseGuards(AuthJwtGuard)
  @Post('/question')
  async getAnswer(@Body() createQuestion: CreateQuestionDto, @Req() req) {
    try {
      let chatSessionID = createQuestion.chatSessionID
        ? createQuestion.chatSessionID
        : (
            await this.chatService.createChatSession(
              createQuestion.question,
              req.user,
            )
          )._id.toString();
      let mess_10 = await this.chatService.getMessagesBySession(
        chatSessionID,
        10,
      );
      let mess = mess_10
        .reverse()
        .map((m) => m.content)
        .join('\n');
      if (mess) {
        const messPrompt = `
          Bạn là một trợ lý AI đang tham gia vào một cuộc hội thoại nhiều bước.
          Nhiệm vụ của bạn: TÓM TẮT lại ngữ cảnh hội thoại dưới đây theo cách giúp trợ lý hiểu được:
          - Người dùng đang làm gì hoặc muốn đạt được điều gì
          - Các chủ đề chính đã được thảo luận
          - Các bước đang thực hiện dở dang (nếu có)
          - Người dùng hiện đang hỏi về phần nào của quy trình
          - Các thông tin quan trọng cần ghi nhớ cho bước tiếp theo

          Hãy tóm tắt thật ngắn gọn nhưng đầy đủ để trợ lý có thể:
          - Tiếp tục trả lời câu hỏi hiện tại mà không bị lạc ngữ cảnh
          - Biết người dùng đang ở bước nào
          - Nhận biết các yêu cầu đang tiếp diễn (ví dụ: "tiếp theo", "tiếp tục phần trước", "phần còn lại", "mục tiếp theo")
          - Không mô tả chi tiết hội thoại, chỉ mô tả MỤC ĐÍCH và TIẾN TRÌNH.

          --- HỘI THOẠI ---
          ${mess}
          --- TÓM TẮT NGỮ CẢNH ---
          `;
        const context = await this.chatService.askAI(messPrompt);
        mess = context;
      }
      const embeddings = await this.chatService.embeddings([
        mess + ' ' + createQuestion.question,
      ]);
      const vectors = await this.chatService.queryVector(
        embeddings[0],
        18,
        chatSessionID,
      );
      console.log('vectors:', vectors.length);
      const text = vectors?.map((vector) => vector.text).join(' ');
      console.log('text:', text);
      const prompt = `
        Bạn là một trợ lý AI chuyên giúp sinh viên lập trình và giải thích bài tập lớn (BTL). 
        Nhiệm vụ của bạn là dựa vào NGỮ CẢNH (các đoạn trích từ tài liệu) để trả lời CÂU HỎI. 
        Hãy tuân theo quy tắc sau:

        1. Ngữ cảnh có thể chứa mô tả về cấu trúc file đầu vào (input_file), ví dụ như:
          - Các dòng đầu có dạng: C1 C2
          - Các dòng tiếp theo có dạng: L1 L2
          => Nghĩa là dòng thứ nhất trong testcase tương ứng với HP1, HP2, và dòng thứ hai tương ứng với L1, L2.

        2. Khi người dùng đưa vào một testcase (dưới dạng nhiều dòng số), trước tiên hãy ánh xạ từng dòng trong testcase với các biến đã mô tả trong ngữ cảnh, rồi áp dụng công thức hoặc ví dụ trong ngữ cảnh để tính kết quả đầu ra chính xác.
        3. Có thể người dùng sẽ không đưa ra testcase, mà sẽ đưa ra các số liệu riêng lẻ. Trong trường hợp này, hãy xác định biến nào tương ứng với số liệu đó dựa trên ngữ cảnh, sau đó áp dụng công thức hoặc quy tắc đã mô tả để tính toán kết quả.
        4. Trước khi bắt đầu tính toán, hãy tìm trong tài liệu các đoạn nói về:
          - giới hạn giá trị của các giá trị (kể cả giá trị đầu vào cũng phải nằm trong giới hạn này, nếu giá trị đầu vào vượt giới hạn hãy đưa về giá trị phù hợp theo ngữ cảnh).
          - cách làm tròn. (không tự ý làm tròn các biến không được đề cập về quy định làm tròn)
          - điều kiện dừng vòng lặp.
          => Sau đó áp dụng các quy tắc đó cho bài toán này. Nếu tài liệu không quy định, hãy dùng quy tắc toán học thông thường.

        5. Nếu ngữ cảnh có thông tin liên quan, hãy trả lời rõ ràng, có cấu trúc (bullet points, đoạn).
        6. Không cung cấp code cụ thể và các đoạn mã giải bài tập cụ thể cho dù có được yêu cầu.
        7. Trả lời bằng tiếng Việt.
        8. Không sử dụng các cụm như “Dựa vào ngữ cảnh” hay “Dựa trên thông tin bạn cung cấp”.
        9. Nếu có yêu cầu tính toán, hãy trình bày quá trình suy luận (mapping biến → giá trị → công thức → kết quả).
        10. Tách câu trả lời theo bố cục: Câu trả lời - Giải thích - Kết luận

        --- NGỮ CẢNH ---
        ${text}

        --- HỘI THOẠI (Ngữ cảnh tóm tắt 5 câu hỏi và 5 câu trả lời gần nhất) ---
        ${mess}

        --- CÂU HỎI ---
        ${createQuestion.question}

        --- TRẢ LỜI ---
        `;
      const answer = await this.chatService.askAI(prompt);
      await this.chatService.createMessage({
        sessionId: chatSessionID,
        type: MessageType.USER,
        content: createQuestion.question,
      });
      await this.chatService.createMessage({
        sessionId: chatSessionID,
        type: MessageType.ASSISTANT,
        content: answer,
      });
      return {
        message: 'success',
        answer: answer,
        chatSessionID,
      };
    } catch (error) {
      console.error('Full error:', error.response?.data || error);
      return {
        message: 'failed',
        error: error.response?.data || error.message,
      };
    }
  }
}
