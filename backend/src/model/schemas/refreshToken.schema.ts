import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";


@Schema({versionKey: false, timestamps: true})
export class RefreshToken extends Document {
    @Prop({ required: true, type: mongoose.Types.ObjectId })
    userId: string;

    @Prop({ required: true, unique: true })
    token: string;

    @Prop({ required: true })
    expiresAt: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);