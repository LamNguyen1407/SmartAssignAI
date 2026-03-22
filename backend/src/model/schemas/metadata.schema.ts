import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type MetadataDocument = Metadata & Document;

@Schema()
export class Metadata {
    // @Prop({ required: true, type: mongoose.Types.ObjectId, ref: "ChatSession" })
    // ChatSessionID: string;

    @Prop({ required: true, type: mongoose.Types.ObjectId, ref: "Course" })
    courseId: string;

    @Prop({ required: true, type: mongoose.Types.ObjectId, ref: "DocumentFile" })
    fileId: string;

    @Prop({ required: true })
    chunks: number;

    @Prop({ required: true })
    embedding: number[];

    @Prop({ required: true })
    text: string;

    @Prop({ type: Map, of: String })
    metadata: Map<string, string>;
}

export const MetadataSchema = SchemaFactory.createForClass(Metadata);