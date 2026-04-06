import { IsNotEmpty, IsString } from "class-validator";

export class CreateChatSessionDto {

    @IsString()
    @IsNotEmpty()
    firstMessage: string;

    @IsString()
    @IsNotEmpty()
    courseId: string;
}