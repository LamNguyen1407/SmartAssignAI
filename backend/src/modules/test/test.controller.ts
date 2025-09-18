import { HttpModuleAsyncOptions } from './../../../node_modules/@nestjs/axios/dist/interfaces/http-module.interface.d';
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
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
        const data = await readPDF(file.buffer);
        const chunks = await splitText(data);
        const embeddings = await this.testService.embeddings(chunks);
        let results = [];
        embeddings.map((embedding, index) => {
            results.push({
                chunks: index,
                embedding: embedding,
                text: chunks[index],
            })
        })
        return { message: 'File uploaded successfully' };
    }
}
