import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  LECTURE = 'lecture'
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['male', 'female', 'other'] })
  gender: Gender;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ default: null })
  phoneNumber?: string;

  @Prop({ default: null })
  avatarUrl?: string;

  @Prop({ default: null })
  dateOfBirth?: Date;

  @Prop({ default: 'user', enum: ['user', 'admin', 'lecture'] })
  role: Role;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isEmailVerified: boolean;

}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1, username: 1 }, { unique: true });