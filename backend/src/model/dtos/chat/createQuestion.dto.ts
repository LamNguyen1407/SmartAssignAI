import { IsNotEmpty, IsString } from "class-validator";

export class CreateQuestionDto {

    @IsString()
    @IsNotEmpty()
    question: string
}