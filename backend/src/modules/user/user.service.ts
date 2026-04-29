import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/model/schemas/user.schema';
import { HttpService } from '@nestjs/axios';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        private readonly httpService: HttpService,
        @InjectModel(User.name) private userModel: Model<User>,
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
}
