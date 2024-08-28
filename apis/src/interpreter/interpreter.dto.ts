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
  ValidateIf,
  Matches,
} from 'class-validator';
import { Types } from 'mongoose';
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
  @ApiProperty({
    example: '59c8ba74c0d97628bf7fec34',
    required: true,
  })
  languageFrom: string;

  @IsOptional()
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
  @ApiProperty({
    example: '59c8ba74c0d97628bf7fec34',
    required: true,
  })
  countryId: string;

  @IsOptional()
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
  //@IsMongoId({ message: 'Something went wrong !' })
  @ApiProperty({
    example: '669a095ff75714f4fffa6e22',
    required: true,
  })
  interpreterId: string;
}

export class interpreterEditProfileDataDto {
  @ApiProperty({
    example: '669a095ff75714f4fffa6e22',
    description: 'ID of the interpreter to be updated',
    required: true,
  })
  @IsMongoId({ message: 'Invalid interpreter ID format.' })
  @IsNotEmpty({ message: 'Interpreter ID is required.' })
  interpreterId: string;

  @ApiProperty({
    example: 'Test Interpreter',
    description: 'Full name of the interpreter',
    required: true,
  })
  @IsString({ message: 'Full name must be a string.' })
  @IsNotEmpty({ message: 'Full name is required.' })
  fullName: string;

  @ApiProperty({
    example: 'male',
    description: 'Gender of the interpreter',
    required: true,
  })
  @IsString({ message: 'Gender must be a string.' })
  @IsNotEmpty({ message: 'Gender is required.' })
  gender: string;

  @ApiProperty({
    example: 'http://example.com/photo.jpg',
    description: "URL of the interpreter's photo",
    required: true,
  })
  @IsString({ message: 'Photo URL must be a string.' })
  @IsNotEmpty({ message: 'Photo URL is required.' })
  @Matches(/\.(jpg|jpeg|png)$/, {
    message: 'Photo URL must end with .jpg, .jpeg, or .png.',
  })
  photo: string;

  @ApiProperty({
    example: '60a7b2f7d564f5412c2f0e87',
    description: 'ID of the country the interpreter is associated with',
    required: true,
  })
  @IsMongoId({ message: 'Invalid country ID format.' })
  @IsNotEmpty({ message: 'Country ID is required.' })
  countryId: Types.ObjectId;

  @ApiProperty({
    example: '60a7b2f7d564f5412c2f0e88',
    description: 'ID of the city the interpreter is associated with',
    required: true,
  })
  @IsMongoId({ message: 'Invalid city ID format.' })
  @IsNotEmpty({ message: 'City ID is required.' })
  cityId: Types.ObjectId;

  @ApiProperty({
    example: 'Experienced interpreter with expertise in various fields',
    description: 'Profile details of the interpreter',
    required: true,
  })
  @IsString({ message: 'Profile details must be a string.' })
  @IsNotEmpty({ message: 'Profile details are required.' })
  profileDetails: string;

  @ApiProperty({
    example: ['IT', 'Computer Science'],
    description: 'Academic background of the interpreter',
    required: true,
  })
  @IsArray({ message: 'Academic background must be an array of strings.' })
  @IsNotEmpty({ message: 'Academic background is required.' })
  academicBackground: string[];

  @ApiProperty({
    example: ['Engineering', 'B.Tech'],
    description: 'Qualifications of the interpreter',
    required: true,
  })
  @IsArray({ message: 'Qualifications must be an array of strings.' })
  @IsNotEmpty({ message: 'Qualifications are required.' })
  qualification: string[];

  @ApiProperty({
    example: ['UG', 'PG'],
    description: 'Associations of the interpreter',
    required: true,
  })
  @IsArray({ message: 'Associations must be an array of strings.' })
  @IsNotEmpty({ message: 'Associations are required.' })
  associations: string[];

  @ApiProperty({
    example: ['59d62f3afd030c582b1975eb'],
    description: 'Native Languages of the interpreter',
    required: true,
  })
  @IsArray({ message: 'Native languages must be an array of ObjectIds.' })
  @IsNotEmpty({ message: 'Native languages are required.' })
  nativeLanguages: Types.ObjectId[];

  @ApiProperty({
    example: ['59d62f3afd030c582b1975eb'],
    description: 'Prefecture ID of the interpreter',
    required: false,
  })
  @IsArray({ message: 'Prefecture IDs must be an array of ObjectIds.' })
  @IsOptional()
  prefectureId: Types.ObjectId[];

  @ApiProperty({
    example: ['59d62f3afd030c582b1975eb'],
    description: 'Interpretation Languages of the interpreter',
    required: true,
  })
  @IsArray({
    message: 'Interpretation languages must be an array of ObjectIds.',
  })
  @IsNotEmpty({ message: 'Interpretation languages are required.' })
  interpretationLanguages: Types.ObjectId[];

  @ApiProperty({
    example: ['59d62f3afd030c582b1975eb'],
    description: 'Expertise List of the interpreter',
    required: true,
  })
  @IsArray({ message: 'Expertise list must be an array of ObjectIds.' })
  @IsNotEmpty({ message: 'Expertise list is required.' })
  expertiseList: Types.ObjectId[];
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
  @IsEnum(["get","add","remove"])
  type: string;

  @IsNotEmpty({ message: 'Please enter removeDocumentIds' })
  @ValidateIf((o) => o.type == 'remove')
  @ApiProperty({
    example: '669a095ff75714f4fffa6e22',
    required: true,
  })
  removeDocumentIds: any;

  @IsNotEmpty({ message: 'Please enter addDocumentData' })
  @ValidateIf((o) => o.type == 'add')
  @ApiProperty({
    example:  'default.jpg',
    required: true,
  })
  addDocumentData: string;
}
