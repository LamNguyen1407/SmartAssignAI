import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Metadata, MetadataDocument } from 'src/model/schemas/metadata.schema';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CreateMetadataDto } from 'src/model/dtos/metadata/metada.dto';

@Injectable()
export class TestService {
    constructor(
        private readonly httpService: HttpService,
        @InjectModel(Metadata.name) private metadataModel: Model<MetadataDocument>,
    ) { }

    private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    async askAI(prompt: string) {
        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        return result.response.text();
    }

    // async create(obj: { chunks: number; embedding: number[]; text: string }) {
    //     const newMetadata = new this.metadataModel(obj);
    //     return newMetadata.save();
    // }
    async create(obj: CreateMetadataDto) {
        const newMetadata = new this.metadataModel(obj);
        return newMetadata.save();
    }

    async queryVector(vector: number[], topK: number) {
        const result = await this.metadataModel.aggregate([
            {
                $vectorSearch: {
                    index: 'vector_index',
                    path: 'embedding',
                    queryVector: vector,
                    numCandidates: 10,
                    limit: topK,
                }
            }
        ]);
        return result;
    }

    async embeddings(chunks: string[]) {
        // const url = 'https://672d4c5fe586.ngrok-free.app/embed';
        const url = process.env.API_EMBEDDINGS;

        const response = await firstValueFrom(this.httpService.post(url, { texts: chunks }));
        return response.data.embeddings;
    }
}
