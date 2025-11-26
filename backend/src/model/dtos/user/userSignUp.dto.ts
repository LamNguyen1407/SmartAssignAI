import { Gender } from "src/model/schemas/user.schema"
import { IsString, IsEmail, IsPhoneNumber, IsOptional, IsDate, IsEnum, MinLength, MaxLength, IsNotEmpty, Matches, IsDateString } from 'class-validator';

export class UserSignUpDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    name: string;

    @IsString()
    @MinLength(3)
    @IsNotEmpty()
    @MaxLength(20)
    username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(20, { message: 'Password must be at most 20 characters long' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/, {
        message:
          'Password must include at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character',
      })
    password: string;
   

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsOptional()
    @IsPhoneNumber('VN')
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @IsOptional()
    @IsDateString()
    dateOfBirth?: Date;

    @IsEnum(Gender)
    @IsNotEmpty()
    gender: Gender;
}