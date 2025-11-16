import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { Message } from './message.schema';

export type ChatSessionDocument = ChatSession & Document;

@Schema()
export class ChatSession {
    @Prop({ required: true, type: mongoose.Types.ObjectId })
    userId: string;

    @Prop({ default: '' })
    sumaryContext: string;

    @Prop({ required: true })
    title: string;

    @Prop({ default: null })
    indexMetadatas: number[];

    @Prop({ type: [Message], default: [] })
    message: Message[];

    @Prop({ required: true })
    timestamp: Date;
}

export const ChatSessionSchema = SchemaFactory.createForClass(ChatSession);