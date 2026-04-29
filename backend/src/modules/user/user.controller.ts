import { Body, Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { Get, Post, UseGuards } from '@nestjs/common';
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
  async getAllUser() {
    const res = await this.userService.getAllUser();
    return res;
  }

  @UseGuards(AuthJwtGuard, RolesGuard)
  @Post('/')
  @Roles(Role.ADMIN)
  async updateUser(
    @Body() userSignUpDto: any
  ) {
    await this.userService.createUser(userSignUpDto);
  }
}
