import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  Length,
  IsEmail,
  IsOptional,
  ValidateIf,
  IsArray,
  ArrayNotEmpty,
  IsString,
  IsEnum,
  IsPhoneNumber,
  Matches,
  IsNumber,
} from 'class-validator';
import { GENDER, SOURCE, SIGNUP_TYPE } from 'common/enums';
import { Transform } from 'class-transformer';

export class RequestOtpSignUp {
  @IsOptional()
  @Length(4, 16, { message: 'Phone number must be between 4 and 16 digits.' }) //TODO REGEX
  @Transform(({ value }) => value?.trim(), { toClassOnly: true })
  @ApiPropertyOptional({
    example: '9876543210',
  })
  phone: string;

  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.trim().toLowerCase(), { toClassOnly: true })
  @ApiPropertyOptional({
    example: 'developer@yopmail.com',
  })
  email: string;

  @IsOptional()
  @Matches(/^\+(\d{1}\-)?(\d{1,3})$/, {
    message:
      'Country code must start with + and be between 0 and 3 digits long.',
  })
  @Transform(({ value }) => value?.trim(), { toClassOnly: true })
  @ApiPropertyOptional({
    example: '+91',
  })
  countryCode: string;

  @Transform(({ value }) => value?.trim().toLowerCase(), { toClassOnly: true })
  @ApiProperty({
    example: 'phone/email',
    required: true,
  })
  @IsEnum(SIGNUP_TYPE)
  type: string;
}

export class VerifyOtpSignUp {
  @IsNotEmpty({ message: 'Please enter a valid OTP.' })
  @Length(0, 6, { message: 'OTP must be 6 digits.' })
  @Transform(({ value }) => value?.trim(), { toClassOnly: true })
  @ApiProperty({
    example: '123456',
    required: true,
  })
  otp: string;

  @IsOptional()
  @Length(4, 16, { message: 'Phone number must be between 4 and 16 digits.' })
  @Transform(({ value }) => value?.trim(), { toClassOnly: true })
  @ApiPropertyOptional({
    example: '9876543210',
  })
  phone: string;

  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.trim().toLowerCase(), { toClassOnly: true })
  @ApiPropertyOptional({
    example: 'developer@yopmail.com',
  })
  email: string;

  @IsOptional()
  @Matches(/^\+(\d{1}\-)?(\d{1,3})$/, {
    message:
      'Country code must start with + and be between 0 and 3 digits long.',
  })
  @Transform(({ value }) => value?.trim(), { toClassOnly: true })
  @ApiPropertyOptional({
    example: '+91',
  })
  countryCode: string;

  @Transform(({ value }) => value?.trim().toLowerCase(), { toClassOnly: true })
  @ApiProperty({
    example: 'phone/email',
    required: true,
  })
  @IsEnum(SIGNUP_TYPE)
  type: string;
}

export class LogInDto {
  @IsNotEmpty({ message: 'Please enter valid email.' })
  @IsEmail()
  @ApiProperty({
    example: 'abc@yopmail.com',
  })
  email: string;

  @IsNotEmpty({ message: 'Please enter valid password.' })
  @MinLength(6)
  @ApiProperty({
    example: '12345678',
    required: true,
  })
  password: string;

  // @IsNotEmpty()
  @ApiProperty({
    required: false,
  })
  timeZone: string;

  // @IsNotEmpty()
  @ApiProperty({
    required: false,
  })
  voipToken: string;

  // @IsNotEmpty()
  @ApiProperty({
    required: false,
  })
  deviceToken: string;
}

export class SignUpInterpreterDto {
  @IsNotEmpty({ message: 'Please enter email' })
  @ApiProperty({
    example: 'abc@yopmail.com',
  })
  email: string;

  @ApiProperty({
    example: 'user/abc.jpg',
  })
  photo: string;

  @IsNotEmpty({ message: 'Please enter fullName' })
  @ApiProperty({
    example: 'oyraa',
    required: true,
  })
  fullName: string;

  @IsNotEmpty({ message: 'Please enter password' })
  @ApiProperty({
    example: 'Abc@1234',
    required: true,
  })
  password: string;

  @IsNotEmpty({ message: 'Please enter gender' })
  @ApiProperty({
    example: 'male/female/other',
    required: true,
  })
  @IsEnum(GENDER)
  gender: string;

  @IsNotEmpty({ message: 'Please enter countryId' })
  @ApiProperty({
    example: '59ca2eb54c5b0874203b7676',
    required: true,
  })
  countryId: string;

  @ApiProperty({
    example: '59ca2eb54c5b0874203b7676',
  })
  prefectureId: string;

  @IsNotEmpty({ message: 'Please enter preferredCurrency' })
  @ApiProperty({
    example: 'JPY',
    required: true,
  })
  preferredCurrency: string;

  @IsNotEmpty({ message: 'Please enter native_languages' })
  @ArrayNotEmpty({
    message: 'The list must have at least one native_languages',
  })
  @ApiProperty({
    example: ['59a3c559891d70748ead0e73'],
    required: true,
  })
  nativeLanguages: [];

  @IsNotEmpty({ message: 'Please enter interpretationLanguages' })
  @ApiProperty({
    example: ['59a3c559891d70748ead0e73'],
    required: true,
  })
  interpretationLanguages: [];

  @ApiProperty({
    example: ['5a28f21ffd030c582b197b44', '5a626eb95398510826280717'],
    required: true,
  })
  expertiseList: [];

  @IsNotEmpty({ message: 'Please enter quilification' })
  @ApiProperty({
    example: ['A', 'B'],
    required: true,
  })
  quilification: [];

  @IsNotEmpty({ message: 'Please enter associations' })
  @ApiProperty({
    example: ['A', 'B'],
  })
  associations: [];

  @IsNotEmpty({ message: 'Please enter professionalDocs' })
  @ApiProperty({
    example: [{ title: 'test1', document: 'abc.jpg' }],
    required: true,
  })
  professionalDocs: [{ title: string; document: string }];

  @ApiProperty({
    example: ['A', 'B'],
  })
  academicBackground: [];

  @IsNotEmpty({ message: 'Please enter source' })
  @ApiProperty({
    example: 'email/social',
    required: true,
    enum: SOURCE,
  })
  @IsEnum(SOURCE)
  source: string;

  @ApiProperty({
    example: 'socialId',
  })
  socialId: string;

  @ApiProperty({
    example: 'gmail/facebook/apple',
  })
  socialType: string;

  @IsNotEmpty({ message: 'Please enter isPTFlag' })
  @ApiProperty({
    example: true,
    required: true,
  })
  isPTFlag: boolean;

  @IsNotEmpty({ message: 'Please enter timezone' })
  @ApiProperty({
    example: 'asia/tokyo',
    required: true,
  })
  timezone: string;

  @IsNotEmpty({ message: 'Please enter gdprAccepted' })
  @ApiProperty({
    example: true,
    required: true,
  })
  gdprAccepted: boolean;

  @ApiProperty({
    example: 'Free50',
  })
  referralCode: string;

  @IsNotEmpty({ message: 'Please enter deviceToken' })
  @ApiProperty({
    example: 'deviceToken',
    required: true,
  })
  deviceToken: string;

  @IsNotEmpty({ message: 'Please enter voipToken' })
  @ApiProperty({
    example: 'voipToken',
  })
  voipToken: string;

  @ApiProperty({
    example: 'bio',
  })
  profileDetails: string;
}

export class SignUpDto {
  @IsNotEmpty({ message: 'Please enter fullName' })
  @ApiProperty({
    example: 'oyraa',
    required: true,
  })
  fullName: string;

  @IsNotEmpty({ message: 'Please enter password' })
  @ApiProperty({
    example: 'Abc@1234',
    required: true,
  })
  password: string;

  @IsNotEmpty({ message: 'Please enter email' })
  @ApiProperty({
    example: 'abc@yopmail.com',
  })
  email: string;

  @IsNotEmpty({ message: 'Please enter gender' })
  @ApiProperty({
    example: 'male/female/other',
    required: true,
  })
  @IsEnum(GENDER)
  gender: string;

  @IsNotEmpty({ message: 'Please enter countryId' })
  @ApiProperty({
    example: '59ca2eb54c5b0874203b7676',
    required: true,
  })
  countryId: string;

  @IsNotEmpty({ message: 'Please enter cityId' })
  @ApiProperty({
    example: '59c8ba74c0d97628bf7fec34',
    required: true,
  })
  cityId: string;

  @ApiProperty({
    example: '59ca2eb54c5b0874203b7676',
  })
  prefectureId: string;

  @IsNotEmpty({ message: 'Please enter native_languages' })
  @ArrayNotEmpty({
    message: 'The list must have at least one native_languages',
  })
  @ApiProperty({
    example: ['59a3c559891d70748ead0e73'],
    required: true,
  })
  nativeLanguages: [];

  @IsNotEmpty({ message: 'Please enter preferredCurrency' })
  @ApiProperty({
    example: 'JPY',
    required: true,
  })
  preferredCurrency: string;

  @ApiProperty({
    example: 'users/image.jpg',
  })
  photo: string;

  @ApiProperty({
    example: 'Free50',
  })
  referralCode: string;

  @IsNotEmpty({ message: 'Please enter isPTFlag' })
  @ApiProperty({
    example: true,
    required: true,
  })
  isPTFlag: boolean;

  @IsNotEmpty({ message: 'Please enter gdprAccepted' })
  @ApiProperty({
    example: true,
    required: true,
  })
  gdprAccepted: boolean;

  @IsNotEmpty({ message: 'Please enter source' })
  @ApiProperty({
    example: 'email/social',
    required: true,
    enum: SOURCE,
  })
  @IsEnum(SOURCE)
  source: string;

  @ApiProperty({
    example: 'socialId',
  })
  socialId: string;

  @ApiProperty({
    example: 'gmail/facebook/apple',
  })
  socialType: string;

  @IsNotEmpty({ message: 'Please enter timezone' })
  @ApiProperty({
    example: 'Asia',
  })
  timezone: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'voipToken',
  })
  voipToken: string;

  @IsNotEmpty()
  @ApiProperty({
    required: true,
    example: 'deviceToken',
  })
  deviceToken: string;
}

export class verifyReferralCodeDto {
  @IsNotEmpty({ message: 'Please enter a valid referral code.' })
  @Transform(({ value }) => value?.trim(), { toClassOnly: true })
  @ApiProperty({
    example: 'FREE50',
    required: true,
  })
  code: string;
}

export class verifyEmailDto {
  @IsNotEmpty({ message: 'Please enter email' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @ApiProperty({
    example: 'abc@yopmail.com',
  })
  email: string;
}

export class changePasswordDto {
  @IsNotEmpty({ message: 'Please enter email' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @ApiProperty({
    example: 'abc@yopmail.com',
  })
  email: string;

  @IsNotEmpty({ message: 'Please enter password' })
  @ApiProperty({
    example: 'Abc@1234',
    required: true,
  })
  password: string;

  @IsNotEmpty({ message: 'Please enter confirm password' })
  @ApiProperty({
    example: 'Abc@1234',
    required: true,
  })
  confirmPassword: string;
}

export class socialSignupDto {
  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @ApiProperty({
    example: 'abc@yopmail.com',
  })
  email: string;

  @IsOptional()
  @ApiProperty({
    example: 'Abc@1234',
    required: true,
  })
  social_id?: string;

  @IsOptional()
  @ApiProperty({
    example: 'Abc@1234',
    required: true,
  })
  social_type?: string;
}

export class dataCollectionsUpdateDto {
  @ApiProperty({
    example: true,
    required: true,
  })
  dataAnaylysisScreen: boolean;

  @ApiProperty({
    example: false,
    required: true,
  })
  tutorialScreen: boolean;

  @ApiProperty({
    example: 'FETCH_DAC_DATA/POST_DCA_DATA',
    required: true,
  })
  type: string; //TODO ENUM - FETCH_DAC_DATA, POST_DCA_DATA
}

export class dataCollectionsAndAnalysisDto {
  @IsNotEmpty()
  @ApiProperty({
    example: '689562sd42554fs455ss',
  })
  roleId: string;
}

export class dataCollectionsAndAnalysisPostDto {
  // @IsObjectId({ message: 'Please Enter Valid objectId' })
  @IsNotEmpty()
  @ApiProperty({
    example: '669a095ff75714f4fffa6e22',
  })
  roleId: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '<h1>Oyraa</h1>',
  })
  title: string;

  @ApiProperty({
    example: '<h2>Interpreter Description</h2>',
  })
  description: string;

  @IsOptional()
  @ApiProperty({
    example: '<h3>Client Description</h3>',
  })
  clientDescription: string;

  @IsNotEmpty({ message: 'Please enter any of the language.' })
  @ApiProperty({
    example: 'en/jp/ko',
  })
  language: string;
}
