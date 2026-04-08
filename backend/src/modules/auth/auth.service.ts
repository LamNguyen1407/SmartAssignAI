import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserLoginDto } from 'src/model/dtos/user/userLogin.dto';
import { UserSignUpDto } from 'src/model/dtos/user/userSignUp.dto';
import { User} from 'src/model/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {v4 as uuidv4} from 'uuid';
import { nanoid } from 'nanoid';
import { RefreshToken } from 'src/model/schemas/refreshToken.schema';
import { RefreshTokenDto } from 'src/model/dtos/user/refreshToken.dto';
import { ChangePasswordDto } from 'src/model/dtos/user/changePassword.dto';
import { ResetToken } from 'src/model/schemas/resetToken.schema';
import { EmailService } from '../email/email.service';
import { ResetPasswordDto } from 'src/model/dtos/user/resetPassword.dto';
@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(RefreshToken.name) private readonly refreshTokenModel: Model<RefreshToken>,
        @InjectModel(ResetToken.name) private readonly resetTokenModel: Model<ResetToken>,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService
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
        const {identifier, password} = userLoginDto;

        //find user by username or email
        const user = await this.userModel.findOne({ $or: [ { username: identifier }, { email:identifier } ] });
        if (!user) {
            throw new BadRequestException('Invalid username or email');
        }

        //compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new BadRequestException('Invalid password');
        }

        const payload = { sub: user._id, role: user.role, name: user.name, email: user.email };

        //generate and return access, refresh token 
        return await this.generateJwtToken(payload);
        
    }

    async refreshTokens(refreshTokenDto: RefreshTokenDto) {
        const { token } = refreshTokenDto;
        console.log('Refreshing token:', token);
        const storedToken = await this.refreshTokenModel.findOne({ token, expiresAt: { $gt: new Date()} });
        if (!storedToken) {
            throw new BadRequestException('Invalid refresh token');
        }   
        return this.generateJwtToken(storedToken.userId);
    }

    async generateJwtToken(payload: any) {
        // Implementation for JWT token generation goes here
        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = uuidv4(); // Generate a unique refresh token
        await this.storeRefreshToken(payload.sub, refreshToken);
        return {accessToken, refreshToken}
    }

    async storeRefreshToken(userId: string, token: string) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Set expiration to 7 days from now
        await this.refreshTokenModel.updateOne({userId} , {$set: {token, expiresAt}}, {upsert: true}); // Use upsert option to create a new document if it doesn't exist({token, userId, expiresAt})
    }

    async logout(userId: string) {
        await this.refreshTokenModel.deleteOne({userId: new Types.ObjectId(userId)});
    }

    async changePassword(userid: string, changePasswordDto: ChangePasswordDto){
        const {oldPassword, newPassword} = changePasswordDto;
        const user =  await this.userModel.findById(userid);
        if(!user){
            throw new BadRequestException('User not found');
        }
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if(!isOldPasswordValid){
            throw new BadRequestException('Old password is incorrect');
        }
        const hashPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashPassword;
        return await user.save();
    }

    async forgotPassword(email: string){
        const user = await this.userModel.findOne({email});
        if(!user){
            throw new BadRequestException('Email not found');
        }
        const resetToken = nanoid(64);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // Set expiration to 1 hour from now
        await this.resetTokenModel.updateOne(
            {userId: user._id},
            {$set: {token: resetToken, expiresAt}},
            {upsert: true}
        );

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        //send mail with reset link (omitted for brevity)
        await this.emailService.sendMail(
            email,
            'Password Reset Request',
            `
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your password.</p>
            <p>Click below to reset it:</p>

            <a href="${resetLink}" style="
                display:inline-block;
                padding:10px 20px;
                background:#4f46e5;
                color:white;
                border-radius:6px;
                text-decoration:none;
            ">Reset Password</a>

            <p>This link will expire in <b>1 hour</b>.</p>
            <p>If you did not request this, ignore this email.</p>
            `
        );
        return {message: 'Link reset password has been sent to your email'};
    }

    async resetPassword(resetPassword: ResetPasswordDto){
        const {token , password} = resetPassword;
        const resetToken = await this.resetTokenModel.findOneAndDelete({token, expiresAt: {$gte: new Date()}});
        if(!resetToken){
            throw new BadRequestException('Invalid or expired reset token');
        }
        const user = await this.userModel.findById(resetToken.userId);
        if(!user){
            throw new BadRequestException('User not found');
        }
        const hashPassword = await bcrypt.hash(password, 10);
        user.password = hashPassword;
        await user.save();
        return {message: 'Password has been reset successfully'};
    }
}
