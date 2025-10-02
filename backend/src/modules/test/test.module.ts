import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { TestService } from './test.service';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Metadata, MetadataSchema } from 'src/model/schemas/metadata.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Metadata.name, schema: MetadataSchema }])
  ],
  controllers: [TestController],
  providers: [TestService]
})
export class TestModule { }
