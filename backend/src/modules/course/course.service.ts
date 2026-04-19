import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCourseDto } from 'src/model/dtos/course/createCourse.dto';
import { UpdateCourseDto } from 'src/model/dtos/course/updateCourse.dto';
import { Course, CourseDocument } from 'src/model/schemas/course.schema';
import { DocumentFile } from 'src/model/schemas/document.schema';
import { Metadata, MetadataDocument } from 'src/model/schemas/metadata.schema';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectModel(DocumentFile.name)
    private readonly fileModel: Model<DocumentFile>,
    @InjectModel(Metadata.name)
    private readonly metaModel: Model<MetadataDocument>,
  ) { }
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

  async getCourseWithFiles() {
    return await this.courseModel.aggregate([
      {
        $lookup: {
          from: 'documentfiles',
          let: { course_id_str: { $toString: '$_id' } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$courseId', '$$course_id_str']
                }
              }
            }
          ],
          as: 'fileList'
        }
      },
      {
        $addFields: {
          totalFiles: { $size: "$fileList" }
        }
      }
    ]).exec();
  }

  async deleteFile(id: string) {
    const file = await this.fileModel.findById(id).exec();
    if (!file) { return false }
    await Promise.all([
      this.fileModel.findByIdAndDelete(id).exec(),
      this.metaModel.deleteMany({ fileId: id }).exec(),
    ]);
    return true;
  }
}
