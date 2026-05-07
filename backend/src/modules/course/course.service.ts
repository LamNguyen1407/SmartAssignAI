import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCourseDto } from 'src/model/dtos/course/createCourse.dto';
import { UpdateCourseDto } from 'src/model/dtos/course/updateCourse.dto';
import { Course, CourseDocument } from 'src/model/schemas/course.schema';
import { DocumentFile } from 'src/model/schemas/document.schema';
import { Metadata, MetadataDocument } from 'src/model/schemas/metadata.schema';
import { ChatSession, ChatSessionDocument } from "src/model/schemas/chatSession.schema";
import { Message } from 'src/model/schemas/message.schema';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectModel(DocumentFile.name)
    private readonly fileModel: Model<DocumentFile>,
    @InjectModel(Metadata.name)
    private readonly metaModel: Model<MetadataDocument>,
    @InjectModel(ChatSession.name)
    private readonly chatSessionModel: Model<ChatSessionDocument>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
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

  async update(id: string, updateCourseDto: any) {
    return await this.courseModel
      .findByIdAndUpdate(id, updateCourseDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    const file = await this.fileModel.find({ courseId: id }).exec();
    if (file.length > 0) {
      throw new BadRequestException('Môn học này đang có tài liệu');
    }
    try {
      const sessions = await this.chatSessionModel.find({ courseId: id }).select('_id').exec();
      const sessionIds = sessions.map(s => s._id);
      return await Promise.all([
        this.courseModel.findByIdAndDelete(id).exec(),
        this.chatSessionModel.deleteMany({ courseId: id }).exec(),
        this.messageModel.deleteMany({ sessionId: { $in: sessionIds } }).exec(),
      ]);
    } catch (error: any) {
      throw new BadRequestException('Lỗi khi xóa môn học: ' + error.message);
    }
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
