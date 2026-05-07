import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { User, UserSchema } from 'src/model/schemas/user.schema';
import { ResetToken, ResetTokenSchema } from 'src/model/schemas/resetToken.schema';
import { RefreshToken, RefreshTokenSchema } from 'src/model/schemas/refreshToken.schema';
import { ChatSession, ChatSessionSchema } from 'src/model/schemas/chatSession.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: ResetToken.name, schema: ResetTokenSchema }]),
    MongooseModule.forFeature([{ name: RefreshToken.name, schema: RefreshTokenSchema }]),
    MongooseModule.forFeature([{ name: ChatSession.name, schema: ChatSessionSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule { }
