import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  MinLength,
  IsEnum,
  MaxLength,
  IsEmail,
  IsOptional,
  ValidateIf,
  IsArray,
  ArrayNotEmpty,
  IsString,
} from 'class-validator';
import { MEDIA_TYPE } from 'common/enums';

export class generateUrl {
  @IsNotEmpty()
  @ApiProperty({
    enum: MEDIA_TYPE,
    example: 'users/prof_docs/chat_images/chat_docs',
    required: true,
  })
  @IsEnum(MEDIA_TYPE)
  type: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'png',
    required: true,
  })
  extention: string;
}
