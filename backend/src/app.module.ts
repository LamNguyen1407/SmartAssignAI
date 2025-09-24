import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestModule } from './modules/test/test.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://machvanphu1999_db_user:pfs0902919129@cluster0.cfiprv5.mongodb.net/chatbot?retryWrites=true&w=majority&appName=Cluster0'),
    ConfigModule.forRoot({ isGlobal: true }),
    TestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
