import { Query } from './../../../node_modules/sift/src/core';
import { HttpModuleAsyncOptions } from './../../../node_modules/@nestjs/axios/dist/interfaces/http-module.interface.d';
import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { readPDF, splitText } from 'src/utils/utils';
import { TestService } from './test.service';
import { CreateQuestionDto } from 'src/model/dtos/chat/createQuestion.dto';
import * as FormData from 'form-data';
import axios from 'axios';

@Controller('test')
export class TestController {
    constructor(private readonly testService: TestService) { }

    @Post('semantic-chunk')
    @UseInterceptors(FileInterceptor('file'))
    async semanticChunk(
        @UploadedFile() file: Express.Multer.File,
    ) {
        try {
            const form = new FormData();
            form.append('file', file.buffer, file.originalname);
            const respone = await axios.post(process.env.API_HANDLE_FILE, form, {
                headers: form.getHeaders(),
            })
            await this.testService.create_many(respone.data);
            return { message: 'File uploaded successfully' };

        } catch (error) {
            return { message: 'File upload failed', error: error.message };
        }
    }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async upload(
        @UploadedFile() file: Express.Multer.File,
    ) {
        try {
            const data = await readPDF(file.buffer);
            const chunks = await splitText(data);
            console.log('api embed called');
            const embeddings = await this.testService.embeddings(chunks);
            console.log('api embed finished');
            // let results = [];
            // embeddings.map(async (embedding, index) => {
            //     await this.testService.create({a
            //         chunks: index,
            //         embedding: embedding,
            //         text: chunks[index],
            //     });
            //     results.push({
            //         chunks: index,
            //         embedding: embedding,
            //         text: chunks[index],
            //     });
            // })
            const results = await Promise.all(embeddings.map(async (embedding, index) => {
                return await this.testService.create({
                    chunks: index,
                    embedding: embedding,
                    text: chunks[index],
                });
            }))

            return { message: 'File uploaded successfully', data: results };
        } catch (error) {
            return { message: 'File upload failed', error: error.message };
        }

    }

    @Post('/question')
    async getAnswer(
        @Body() createQuestion: CreateQuestionDto
    ) {
        try {
            const embeddings = await this.testService.embeddings([createQuestion.question]);
            // console.log(embeddings);
            const vectors = await this.testService.queryVector(embeddings[0], 5);
            // console.log(vectors);
            const text = vectors.map(vector => vector.text).join(' ');
            // console.log(text);
            // const prompt = `
            //     Bạn là trợ lý AI hỗ trợ lập trình về bài tập lớn,
            //     dưới đây là ngữ cảnh của đề bài.
            //     Nếu không biết thì trả lời là "Tôi không rõ".
            //     Ngữ cảnh: ${text}
            //     Câu hỏi: ${body.question}
            //     Trả lời:
            // `;
            const prompt = `
                Bạn là một trợ lý AI chuyên giúp sinh viên lập trình và giải thích bài tập lớn (BTL). 
                Nhiệm vụ của bạn là dựa vào NGỮ CẢNH (các đoạn trích từ tài liệu) để trả lời CÂU HỎI. 
                Hãy tuân theo quy tắc sau:

                1. Nếu trong ngữ cảnh có thông tin liên quan, hãy trả lời đầy đủ, rõ ràng, và có cấu trúc (có thể dùng bullet points hoặc chia đoạn).
                2. Nếu có câu trả lời hãy chỉ rõ câu trả lời dựa vào đoạn trích nào trong ngữ cảnh.
                3. Nếu ngữ cảnh không đủ để trả lời, hãy trả lời chính xác: "Tôi không rõ."
                4. Không tự bịa thêm thông tin ngoài ngữ cảnh.
                5. Ưu tiên giải thích chi tiết, dễ hiểu, có ví dụ nếu phù hợp.
                6. Không cung cấp các đoạn mã giải bài tập cụ thể cho dù có được yêu cầu.
                7. Trả lời bằng tiếng Việt.
                8. Hạn chế sử dụng các cụm từ như "Dựa vào ngữ cảnh đã cho" hoặc "Dựa trên thông tin bạn cung cấp".

                --- NGỮ CẢNH ---
                ${text}

                --- CÂU HỎI ---
                ${createQuestion.question}

                --- TRẢ LỜI ---
                `;

            const answer = await this.testService.askAI(prompt);
            return {
                message: 'success',
                answer: answer
            };
        } catch (error) {
            console.error('Full error:', error.response?.data || error);
            return {
                message: 'failed',
                error: error.response?.data || error.message
            };
        }
    }
}
