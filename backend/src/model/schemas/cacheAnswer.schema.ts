import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from 'mongoose';

export type CacheAnswerDocument = CacheAnswer & Document;

@Schema({ timestamps: true })
export class CacheAnswer extends Document {
    @Prop({ required: true, type: mongoose.Types.ObjectId, ref: "Course" })
    courseId: string;

    @Prop({ required: true })
    question: string;

    @Prop({ required: true })
    answer: string;

    @Prop({ required: true })
    summary: string;

    @Prop({ required: true })
    embedding: number[];

    @Prop({ default: 0 })
    hit: number;

    @Prop({ default: Date.now })
    lastHitAt: Date;
}

export const CacheAnswerSchema = SchemaFactory.createForClass(CacheAnswer);