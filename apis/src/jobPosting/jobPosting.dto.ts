import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  MinLength,
  Length,
  IsEmail,
  IsOptional,
  ValidateIf,
  ArrayNotEmpty,
  IsEnum,
  Matches,
  IsArray,
  IsMongoId,
} from 'class-validator';
import {
  GENDER,
  SOURCE,
  SIGNUP_TYPE,
  ANALYSIS_SCREEN_TYPE,
  SOCIAL_TYPE,
  USER_ROLE,
} from 'common/enums';
import { Transform } from 'class-transformer';

export class CreateJobPostingDataDto {
}