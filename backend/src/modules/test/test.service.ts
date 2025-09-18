import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TestService {
    constructor(private readonly httpService: HttpService) { }

    async embeddings(chunks: string[]) {
        const url = 'https://fbf3bed69cc8.ngrok-free.app/embed';
        const response = await firstValueFrom(this.httpService.post(url, { texts: chunks }));
        return response.data.embeddings;
    }
}
