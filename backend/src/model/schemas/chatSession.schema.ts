import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ChatSessionDocument = ChatSession & Document;

@Schema({ timestamps: true })
export class ChatSession {
  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: "Course" })
  courseId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  summaryContext: string;

  // Liên kết với 1 tài liệu đã embed (tách riêng)
  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'DocumentFile', default: null })
  // documentId: string | null;
}

export const ChatSessionSchema = SchemaFactory.createForClass(ChatSession);

ChatSessionSchema.pre('findOneAndDelete', async function (next) {
  try {
    const sessionId = this.getFilter()['_id'];
    if (!sessionId) return next();
    await Promise.all([
      mongoose.model('Message').deleteMany({ sessionId }),
      mongoose.model('DocumentFile').deleteMany({ sessionId }),
      mongoose.model('Metadata').deleteMany({ ChatSessionID: sessionId }),
    ])
    next();
  }
  catch (err) {
    next(err);
  }
});
