import { 
  IsEmail,
  IsNotEmpty, 
  IsString,
  ValidateIf,
} from 'class-validator';

export class UserLoginDto {
  @ValidateIf(o => !o.email)
  @IsString()
  @IsNotEmpty()
  username?: string;

  @ValidateIf(o => !o.username)
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
