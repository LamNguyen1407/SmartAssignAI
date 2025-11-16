import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MessageType } from '../../interface/type';

export type MessageDocument = Message & Document;

@Schema()
export class Message {
    @Prop({ required: true })
    type: MessageType;

    @Prop({ required: true })
    content: string;

    @Prop({ required: true })
    timestamp: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);