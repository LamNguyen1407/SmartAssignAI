import { Body, Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { Get, Patch, Post, Delete, Req, UseGuards } from '@nestjs/common';
import { AuthJwtGuard } from '../guards/jwt.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/model/schemas/user.schema';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @UseGuards(AuthJwtGuard, RolesGuard)
  @Get('/allUser')
  @Roles(Role.ADMIN)
  async getAllUser(
    @Req() req: any
  ) {
    const res = await this.userService.getAllUser(req.user.userId);
    return res;
  }

  @UseGuards(AuthJwtGuard, RolesGuard)
  @Post('/')
  @Roles(Role.ADMIN)
  async updateUser(
    @Body() userSignUpDto: any
  ) {
    return await this.userService.createUser(userSignUpDto);
  }

  @UseGuards(AuthJwtGuard, RolesGuard)
  @Patch('/')
  @Roles(Role.ADMIN)
  async editUser(
    @Body() userEditDto: any
  ) {
    return await this.userService.editUser(userEditDto);
  }

  @UseGuards(AuthJwtGuard, RolesGuard)
  @Delete('/')
  @Roles(Role.ADMIN)
  async deleteUser(
    @Body() userData: any
  ) {
    return await this.userService.deleteUser(userData);
  }
}
