import { Query } from './../../../node_modules/sift/src/core';
import { HttpModuleAsyncOptions } from './../../../node_modules/@nestjs/axios/dist/interfaces/http-module.interface.d';
import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { readPDF, splitText } from 'src/utils/utils';
import { TestService } from './test.service';

@Controller('test')
export class TestController {
    constructor(private readonly testService: TestService) { }

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
            //     await this.testService.create({
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
        @Body() body: { question: string }
    ) {
        try {
            const embeddings = await this.testService.embeddings([body.question]);
            const vectors = await this.testService.queryVector(embeddings[0], 5);
            const text = vectors.map(vector => vector.text).join(' ');
            console.log(text);
            const prompt = `
                Bạn là trợ lý AI hỗ trợ lập trình về bài tập lớn,
                dưới đây là ngữ cảnh của đề bài.
                Nếu không biết thì trả lời là "Tôi không rõ".
                Ngữ cảnh: ${text}
                Câu hỏi: ${body.question}
                Trả lời:
            `;
            const answer = await this.testService.askAI(prompt);
            return {
                message: 'success',
                answer: answer
            };
        } catch (error) {
            return { message: 'failed', error: error.message };
        }
    }
}
