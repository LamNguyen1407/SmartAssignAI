import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Metadata, MetadataSchema } from 'src/model/schemas/metadata.schema';
import { ChatSession, ChatSessionSchema } from 'src/model/schemas/chatSession.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Metadata.name, schema: MetadataSchema }]),
    MongooseModule.forFeature([{ name: ChatSession.name, schema: ChatSessionSchema }]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule { }
