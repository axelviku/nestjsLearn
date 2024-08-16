import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  ArrayNotEmpty,
  IsArray,
  ValidateNested,
  ArrayUnique,
  IsString,
  IsNumber,
  IsMongoId,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Language } from 'common/schemas/language.schema';

export class interpreterDataDto {
  @IsOptional()
  @Transform(({ value }) => value?.trim().toLowerCase(), { toClassOnly: true })
  @ApiProperty({
    example: 'Sonogo Koga',
    required: true,
  })
  searchKeyword: string;

  @IsOptional()
  @IsMongoId({ message: 'Something went wrong !' })
  @ApiProperty({
    example: '59c8ba74c0d97628bf7fec34',
    required: true,
  })
  languageFrom: string;

  @IsOptional()
  @IsMongoId({ message: 'Something went wrong !' })
  @ApiProperty({
    example: '59c8ba74c0d97628bf7fec34',
    required: true,
  })
  languageTo: string;

  @IsOptional()
  @ArrayNotEmpty({
    message: 'The list must have at least one value to filter',
  })
  @ApiProperty({
    example: ['59a3c559891d70748ead0e73'],
    required: true,
  })
  expertiseIds: [];

  @IsOptional()
  @IsMongoId({ message: 'Something went wrong !' })
  @ApiProperty({
    example: '59c8ba74c0d97628bf7fec34',
    required: true,
  })
  countryId: string;

  @IsOptional()
  @IsMongoId({ message: 'Something went wrong !' })
  @ApiProperty({
    example: '59c8ba74c0d97628bf7fec34',
    required: true,
  })
  cityId: string;

  @IsOptional()
  @ApiProperty({
    example: true,
    required: false,
  })
  isOnline: boolean;

  @IsOptional()
  @ApiProperty({
    example: true,
    required: false,
  })
  isProfessionalInterpreter: boolean;
}

export class interpreterProfileDataDto {
  @IsMongoId({ message: 'Something went wrong !' })
  @ApiProperty({
    example: '669a095ff75714f4fffa6e22',
    required: true,
  })
  interpreterId: string;
}

export class interpreterEditProfileDataDto {
  @IsOptional()
  @Transform(({ value }) => value?.trim().toLowerCase(), { toClassOnly: true })
  @ApiProperty({
    example: 'Sonogo Koga',
    required: true,
  })
  searchKeyword: string;

  @IsOptional()
  @IsMongoId({ message: 'Something went wrong !' })
  @ApiProperty({
    example: '59c8ba74c0d97628bf7fec34',
    required: true,
  })
  languageFrom: string;

  @IsOptional()
  @IsMongoId({ message: 'Something went wrong !' })
  @ApiProperty({
    example: '59c8ba74c0d97628bf7fec34',
    required: true,
  })
  languageTo: string;

  @IsOptional()
  @ArrayNotEmpty({
    message: 'The list must have at least one value to filter',
  })
  @ApiProperty({
    example: ['59a3c559891d70748ead0e73'],
    required: true,
  })
  expertiseIds: [];

  @IsOptional()
  @IsMongoId({ message: 'Something went wrong !' })
  @ApiProperty({
    example: '59c8ba74c0d97628bf7fec34',
    required: true,
  })
  countryId: string;

  @IsOptional()
  @IsMongoId({ message: 'Something went wrong !' })
  @ApiProperty({
    example: '59c8ba74c0d97628bf7fec34',
    required: true,
  })
  cityId: string;

  @IsOptional()
  @ApiProperty({
    example: true,
    required: false,
  })
  isOnline: boolean;

  @IsOptional()
  @ApiProperty({
    example: true,
    required: false,
  })
  isProfessionalInterpreter: boolean;
}

export class updateOnlineStatusDataDto {
  @ApiProperty({
    example: true,
    required: true,
  })
  status: boolean;
}

export class interpreterProfileReviewDataDto {
  @ApiProperty({
    example: '669a095ff75714f4fffa6e22',
    required: true,
  })
  interpreterId: string;

  @ApiProperty({
    example: '1',
    required: true,
  })
  page: string;
}

class editRates {
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  languages: string[];

  @IsNumber()
  fee: number;

  @IsString()
  currency: string;
}

export class editInterpretationRatesDataDto {
  @ApiProperty({
    example: [
      {
        languages: ['669a095ff75714f4fffa6e22', '669a095ff75714f4fffa6e22'],
        fee: 0.8,
        currency: 'JPY',
      },
    ],
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => editRates)
  rates: editRates[];
}

export class uploadProfessionalDocsDataDto {
  @ApiProperty({
    example: 'get/add/remove',
    required: true,
  })
  type: string;

  @IsOptional()
  @ApiProperty({
    example: ['669a095ff75714f4fffa6e22'],
    required: true,
  })
  removeDocumentIds: any;

  @IsOptional()
  @ApiProperty({
    example: [{ document: 'default.jpg' }, { document: 'test.pdf' }],
    required: true,
  })
  addDocumentData: any;
}
