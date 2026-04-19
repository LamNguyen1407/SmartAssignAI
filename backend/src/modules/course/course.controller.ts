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

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) { }

  @Post()
  async create(@Body() createCourseDto: CreateCourseDto) {
    return await this.courseService.create(createCourseDto);
  }

  @Get()
  async findAll() {
    return await this.courseService.findAll();
  }

  @UseGuards(AuthJwtGuard)
  @Get('/getCourseWithFiles')
  async getCourseWithFiles() {
    const data = await this.courseService.getCourseWithFiles();
    return data;
  }

  @Delete('/file')
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
