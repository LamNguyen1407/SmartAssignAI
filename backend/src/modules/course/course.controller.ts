import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from 'src/model/dtos/course/createCourse.dto';
import { UpdateCourseDto } from 'src/model/dtos/course/updateCourse.dto';
import { AuthJwtGuard } from '../guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/model/schemas/user.schema';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) { }

  @UseGuards(AuthJwtGuard, RolesGuard)
  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() createCourseDto: CreateCourseDto) {
    return await this.courseService.create(createCourseDto);
  }

  @Get()
  async findAll() {
    return await this.courseService.findAll();
  }

  @UseGuards(AuthJwtGuard, RolesGuard)
  @Get('/getCourseWithFiles')
  @Roles(Role.ADMIN, Role.LECTURE)
  async getCourseWithFiles() {
    const data = await this.courseService.getCourseWithFiles();
    return data;
  }

  @UseGuards(AuthJwtGuard, RolesGuard)
  @Delete('/file')
  @Roles(Role.ADMIN, Role.LECTURE)
  async deleteFile(@Query('id') id: string) {
    console.log("here");
    console.log(id);
    const deletedFile = await this.courseService.deleteFile(id);
    if (!deletedFile) {
      return {
        message: 'File not found',
      };
    }
    return {
      message: 'File deleted successfully',
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.courseService.findOne(+id);
  }

  @Get('/sessions/:sessionId')
  async findBySessionId(@Param('sessionId') sessionId: string) {
    return await this.courseService.findBySessionId(sessionId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return await this.courseService.update(+id, updateCourseDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.courseService.remove(+id);
  }
}
