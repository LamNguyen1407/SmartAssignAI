import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserLoginDto } from 'src/model/dtos/user/userLogin.dto';
import { UserSignUpDto } from 'src/model/dtos/user/userSignUp.dto';
import { User} from 'src/model/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {v4 as uuidv4} from 'uuid';
import { RefreshToken } from 'src/model/schemas/refreshToken.schema';
import { RefreshTokenDto } from 'src/model/dtos/user/refreshToken.dto';
@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(RefreshToken.name) private readonly refreshTokenModel: Model<RefreshToken>,
        private readonly jwtService: JwtService,
) {}

    // async validateUser(userLoginDto: UserLoginDto): Promise<any> {
    //     const {username, password} = userLoginDto;
    //     const user = await this.userModel.findOne({ username });
    //     if (user && user.password === password) {
    //         const { password, ...result } = user;
    //         return result;
    //     }
    //     return null;
    // }

    async signUp(userSignUpDto: UserSignUpDto) {
        //check if email or username exists
        const {username, email, password} = userSignUpDto;
        const existingUser = await this.userModel.findOne({ $or: [ { username }, { email } ] });
        if (existingUser) {
            throw new BadRequestException('Username or email already exists');
        }
        //hash password before saving (omitted for brevity)
        const hashPassword = await bcrypt.hash(password, 10);
        return this.userModel.create({...userSignUpDto, password: hashPassword});
    }

    async login(userLoginDto: UserLoginDto) {
        const {username, password, email} = userLoginDto;

        //find user by username or email
        const user = await this.userModel.findOne({ $or: [ { username }, { email } ] });
        if (!user) {
            throw new UnauthorizedException('Invalid username or email');
        }

        //compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        //generate and return access, refresh token 
        return await this.generateJwtToken(user._id as string);
        
    }

    async refreshTokens(refreshTokenDto: RefreshTokenDto) {
        const { token } = refreshTokenDto;
        const storedToken = await this.refreshTokenModel.findOne({ token, expiresAt: { $gt: new Date()} });
        if (!storedToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }   
        return this.generateJwtToken(storedToken.userId);
    }

    async generateJwtToken(userId: string) {
        // Implementation for JWT token generation goes here
        const accessToken = await this.jwtService.signAsync({ sub: userId });
        const refreshToken = uuidv4(); // Generate a unique refresh token
        await this.storeRefreshToken(userId, refreshToken);
        return {accessToken, refreshToken}
    }

    async storeRefreshToken(userId: string, token: string) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Set expiration to 7 days from now
        await this.refreshTokenModel.updateOne({userId} , {$set: {token, expiresAt}}, {upsert: true}); // Use upsert option to create a new document if it doesn't exist({token, userId, expiresAt})
    }

}
