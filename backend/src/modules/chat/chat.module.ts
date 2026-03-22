import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Metadata, MetadataSchema } from 'src/model/schemas/metadata.schema';
import { ChatSession, ChatSessionSchema } from 'src/model/schemas/chatSession.schema';
import { DocumentFile, DocumentFileSchema } from '../../model/schemas/document.schema';
import { Message, MessageSchema } from 'src/model/schemas/message.schema';
import { Course, CourseSchema } from 'src/model/schemas/course.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Metadata.name, schema: MetadataSchema }]),
    MongooseModule.forFeature([{ name: ChatSession.name, schema: ChatSessionSchema }]),
    MongooseModule.forFeature([{ name: DocumentFile.name, schema: DocumentFileSchema }]),
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule { }
