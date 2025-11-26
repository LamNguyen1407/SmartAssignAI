import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

@Schema({ timestamps: true })
export class DocumentFile extends Document {
    @Prop({ required: true })
    filename: string;

    @Prop({ default: '' })
    url: string; // MinIO / S3 URL

    @Prop({ required: true })
    mimetype: string; // "application/pdf", "text/markdown", ...

    @Prop({ required: true })
    size: number; // bytes

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' })
    userId: string;

    // Optional → link tới ChatSession
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession' })
    sessionId?: string;
}

export const DocumentFileSchema = SchemaFactory.createForClass(DocumentFile);