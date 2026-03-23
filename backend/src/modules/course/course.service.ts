import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCourseDto } from 'src/model/dtos/course/createCourse.dto';
import { UpdateCourseDto } from 'src/model/dtos/course/updateCourse.dto';
import { Course, CourseDocument } from 'src/model/schemas/course.schema';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
  ) {}
  async create(createCourseDto: CreateCourseDto) {
    const createdCourse = new this.courseModel(createCourseDto);
    return await createdCourse.save();
  }

  async findAll() {
    return await this.courseModel.find().exec();
  }

  async findOne(id: number) {
    return await this.courseModel.findById(id).exec();
  }

  async findBySessionId(sessionId: string) {
    return await this.courseModel.find({ sessionId }).exec();
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    return await this.courseModel
      .findByIdAndUpdate(id, updateCourseDto, { new: true })
      .exec();
  }

  async remove(id: number) {
    return await this.courseModel.findByIdAndDelete(id).exec();
  }
}
