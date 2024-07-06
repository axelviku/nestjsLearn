import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength, MaxLength, IsEmail, IsOptional, ValidateIf } from 'class-validator';

export class LogInDto{
    @IsNotEmpty()
    @ApiProperty({
        example: 'abc@yopmail.com',
    })
    email : string

    @IsNotEmpty()
    @MinLength(6)
    @ApiProperty({
        example: '12345678',
        required: true
    })
    password : string
}
