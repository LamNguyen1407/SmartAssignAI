import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from 'src/model/schemas/course.schema';
import { DocumentFile, DocumentFileSchema } from 'src/model/schemas/document.schema';
import { Metadata, MetadataSchema } from 'src/model/schemas/metadata.schema';
import { ChatSession, ChatSessionSchema } from 'src/model/schemas/chatSession.schema';
import { Message, MessageSchema } from 'src/model/schemas/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
    MongooseModule.forFeature([{ name: DocumentFile.name, schema: DocumentFileSchema }]),
    MongooseModule.forFeature([{ name: Metadata.name, schema: MetadataSchema }]),
    MongooseModule.forFeature([{ name: ChatSession.name, schema: ChatSessionSchema }]),
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule { }
