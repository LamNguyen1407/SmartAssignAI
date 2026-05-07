import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/model/schemas/user.schema';
import { ResetToken } from "src/model/schemas/resetToken.schema";
import { RefreshToken } from "src/model/schemas/refreshToken.schema";
import { ChatSession } from 'src/model/schemas/chatSession.schema';
import { HttpService } from '@nestjs/axios';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        private readonly httpService: HttpService,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(ResetToken.name) private resetTokenModel: Model<ResetToken>,
        @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshToken>,
        @InjectModel(ChatSession.name) private chatSessionModel: Model<ChatSession>
    ) { }

    async getAllUser(currentUserId?: string) {
        return await this.userModel.find({ _id: { $ne: currentUserId } }, { password: 0 }).exec();
    }

    async createUser(userSignUpDto: any) {
        const { username, email, password } = userSignUpDto;
        const existingUser = await this.userModel.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            throw new BadRequestException('Tài khoản hoặc email đã tồn tại');
        }
        const hashPassword = await bcrypt.hash(password, 10);
        return this.userModel.create({ ...userSignUpDto, password: hashPassword });
    }

    async editUser(userEditDto: any) {
        const { id, ...updateData } = userEditDto;
        return await this.userModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    async deleteUser(userData: any) {
        const { id } = userData;
        try {
            return await Promise.all([
                this.userModel.findByIdAndDelete(id),
                this.resetTokenModel.deleteMany({ userId: id }),
                this.refreshTokenModel.deleteMany({ userId: id }),
                this.chatSessionModel.deleteMany({ userId: id }),
            ]);
        } catch (error: any) {
            throw new Error(`Lỗi khi xóa người dùng: ${error.message}`);
        }
    }
}
