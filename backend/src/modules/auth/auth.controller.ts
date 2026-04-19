import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from 'src/model/dtos/user/userLogin.dto';
import { UserSignUpDto } from 'src/model/dtos/user/userSignUp.dto';
import { Request, Response } from 'express';
import { AuthJwtGuard } from '../guards/jwt.guard';
import { ChangePasswordDto } from 'src/model/dtos/user/changePassword.dto';
import { ForgotPasswordDto } from 'src/model/dtos/user/forgotPassword.dto';
import { ResetPasswordDto } from 'src/model/dtos/user/resetPassword.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  async signUp(@Body() userSignUpDto: any) {
    return this.authService.signUp(userSignUpDto);
  }

  @Post('login')
  async login(
    @Body() userLoginDto: UserLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken, userWithoutPassword } = await this.authService.login(userLoginDto);

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 180 * 24 * 60 * 60 * 1000,
    });

    return { message: 'Login successful', data: userWithoutPassword };
  }

  @Post('refresh')
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = req.cookies['refreshToken'];
    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshTokens({ token: refreshToken });

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
    });

    response.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: 'Tokens refreshed successfully' };
  }

  @UseGuards(AuthJwtGuard)
  @Get('profile')
  async protectedRoute(@Req() req) {
    console.log('Accessing protected route with user:', req.user);
    return { user: req.user, message: 'You have accessed a protected route' };
  }

  @UseGuards(AuthJwtGuard)
  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response, @Req() req) {
    await this.authService.logout(req.user.userId);

    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    return { message: 'Logout successful' };
  }

  @UseGuards(AuthJwtGuard)
  @Post('change-password')
  async changePassword(
    @Req() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(req.user.userId, changePasswordDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }
}
