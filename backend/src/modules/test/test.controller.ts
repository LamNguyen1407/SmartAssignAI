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
            const vectors = await this.testService.queryVector(embeddings[0], 18);
            const text = vectors.map(vector => vector.text).join(' ');
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
                    - cách làm tròn.
                    - điều kiện dừng vòng lặp.
                    => Sau đó áp dụng các quy tắc đó cho bài toán này. Nếu tài liệu không quy định, hãy dùng quy tắc toán học thông thường.

                5. Nếu ngữ cảnh có thông tin liên quan, hãy trả lời rõ ràng, có cấu trúc (bullet points, đoạn).
                6. Không cung cấp code cụ thể và các đoạn mã giải bài tập cụ thể cho dù có được yêu cầu.
                7. Trả lời bằng tiếng Việt.
                8. Không sử dụng các cụm như “Dựa vào ngữ cảnh” hay “Dựa trên thông tin bạn cung cấp”.
                9. Nếu có yêu cầu tính toán, hãy trình bày quá trình suy luận (mapping biến → giá trị → công thức → kết quả).
                10. Không sử dụng giá trị trong ví dụ để tính, chỉ dùng công thức hoặc quy tắc logic được mô tả.

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
