import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from 'src/model/dtos/user/userLogin.dto';
import { UserSignUpDto } from 'src/model/dtos/user/userSignUp.dto';
import { RefreshTokenDto } from 'src/model/dtos/user/refreshToken.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('signup')
  async signUp(@Body() userSignUpDto: UserSignUpDto){
    return this.authService.signUp(userSignUpDto)
  }

  @Post('login')
  async login(@Body() userLoginDto: UserLoginDto){
    return this.authService.login(userLoginDto)
  }

  @Post('refresh')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto){
    return this.authService.refreshTokens(refreshTokenDto)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async protectedRoute(@Request() req){
    return {userId: req.user, message: 'You have accessed a protected route' };
  }


}
