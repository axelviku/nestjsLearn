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

export class RequestOtpSignUp {
  @IsOptional()
  @Matches(/^\d+$/, { message: 'Phone Number should be number' })
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
  @Matches(/^\+(\d{1}\-)?(\d{1,4})$/, {
    message:
      'Country code must start with + and be between 0 and 4 digits long.',
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

  @Transform(({ value }) => value?.trim().toLowerCase(), { toClassOnly: true })
  @ApiProperty({
    example: 'client/interpreter',
    required: true,
  })
  @IsEnum(USER_ROLE)
  userRole: string;
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
  @Matches(/^\d+$/, { message: 'Phone Number should be number' })
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
  @Matches(/^\+(\d{1}\-)?(\d{1,4})$/, {
    message:
      'Country code must start with + and be between 0 and 4 digits long.',
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
  @Transform(({ value }) => value?.trim().toLowerCase(), { toClassOnly: true })
  @IsEmail()
  @ApiProperty({
    example: 'developer@yopmail.com',
  })
  email: string;
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/,
    {
      message:
        'Password atleast 8 char one small, capital, special chatarter and one number.',
    },
  )
  @IsNotEmpty({ message: 'Please enter valid password.' })
  @ValidateIf((o) => o.source == 'email')
  @MinLength(6)
  @ApiProperty({
    example: '12345678',
    required: true,
  })
  password: string;

  @ApiProperty({
    required: false,
    example: 'asia/tokyo',
  })
  timezone: string;

  @IsOptional({
    message:
      'Something went wrong ! Your Phone is allowing to get device voip token!',
  })
  @ApiProperty({
    example: '0ac2694a8dfba8901f550254cfef6f7ef5e2dbbfc4c29c450db69a22c404cfd2',
  })
  voipToken: string;

  @IsNotEmpty({
    message:
      'Something went wrong ! Your Phone is allowing to get device token!',
  })
  @ApiProperty({
    example: 'CDDA56739701593CBB44F3359B6C49DD0B4ABF2286946352802B71DC03AAE2E3',
  })
  deviceToken: string;
}

export class SignUpInterpreterDto {
  @IsNotEmpty({ message: 'Please enter a email' })
  @Transform(({ value }) => value?.trim().toLowerCase(), { toClassOnly: true })
  @ApiProperty({
    example: 'developer@yopmail.com',
    required: true,
  })
  email: string;

  @IsOptional()
  @Matches(/^\d+$/, { message: 'Phone Number should be number' })
  @Length(4, 16, { message: 'Phone number must be between 4 and 16 digits.' })
  @Transform(({ value }) => value?.trim(), { toClassOnly: true })
  @ApiProperty({
    example: '9876543210',
    required: true,
  })
  phone: string;

  @IsOptional()
  @Matches(/^\+(\d{1}\-)?(\d{1,4})$/, {
    message:
      'Country code must start with + and be between 0 and 4 digits long.',
  })
  @Transform(({ value }) => value?.trim(), { toClassOnly: true })
  @ApiPropertyOptional({
    example: '+91',
  })
  countryCode: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim(), { toClassOnly: true })
  @ApiPropertyOptional({
    example: '+919876543210',
  })
  formattedMobile: string;

  @ApiProperty({
    example: 'user/default.jpg',
  })
  photo: string;

  @IsNotEmpty({ message: 'Please enter your name.' })
  @Transform(({ value }) => value?.trim(), { toClassOnly: true })
  @ApiProperty({
    example: 'Developer Rock!',
    required: true,
  })
  fullName: string;

  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/,
    {
      message:
        'Password atleast 8 char one small, capital, special chatarter and one number.',
    },
  )
  @IsNotEmpty({ message: 'Please enter password' })
  @ValidateIf((o) => o.source == 'email')
  @ApiProperty({
    example: 'Test@1234',
    required: true,
  })
  password: string;

  @IsNotEmpty({ message: 'Please enter a gender' })
  @ApiProperty({
    example: 'male/female/other',
    required: true,
  })
  @IsEnum(GENDER)
  gender: string;

  @IsNotEmpty({ message: 'Please enter Country Name' })
  @IsMongoId({ message: 'Something went wrong !' })
  @ApiProperty({
    example: '59ca2eb54c5b0874203b7676',
    required: true,
  })
  countryId: string;

  @IsOptional()
  @IsMongoId({ message: 'Something went wrong !' })
  @ApiProperty({
    example: '59ca2eb54c5b0874203b7676',
  })
  prefectureId: string;

  @IsNotEmpty({ message: 'Please enter your Preferred Currency' })
  @ApiProperty({
    example: 'JPY',
    required: true,
  })
  preferredCurrency: string;

  @IsNotEmpty({ message: 'Please enter Native Languages' })
  @IsArray()
  @ArrayNotEmpty({
    message: 'The list must have at least one Native Languages',
  })
  @ApiProperty({
    example: ['59a3c559891d70748ead0e73'],
    required: true,
  })
  nativeLanguages: [];

  @IsNotEmpty({ message: 'Please enter a Language you want to interpretate.' })
  @IsArray()
  @ArrayNotEmpty({
    message: 'The list must have at least one Interpretation Languages',
  })
  @ApiProperty({
    example: ['59a3c559891d70748ead0e73'],
    required: true,
  })
  interpretationLanguages: [];

  @IsNotEmpty({ message: 'Please enter Area of Expertise.' })
  @IsArray()
  @ArrayNotEmpty({
    message: 'The list must have at least one Expertise.',
  })
  @ApiProperty({
    example: ['5a28f21ffd030c582b197b44', '5a626eb95398510826280717'],
    required: true,
  })
  expertiseList: [];

  @IsOptional()
  @IsArray()
  @ApiProperty({
    example: ['A', 'B'],
  })
  qualification: [];

  @IsOptional()
  @IsArray()
  @ApiProperty({
    example: ['A', 'B'],
  })
  associations: [];

  @IsOptional()
  @IsArray()
  @ApiProperty({
    example: ['abc.jpg'],
  })
  professionalDocs: [{ title: string; document: string }];

  @IsOptional()
  @IsArray()
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

  @IsNotEmpty({ message: 'Please enter socialId' })
  @ValidateIf((o) => o.source == 'social')
  @ApiProperty({
    example: 'socialId',
  })
  socialId: string;

  @IsNotEmpty({ message: 'Please enter socialType' })
  @ValidateIf((o) => o.source === 'social')
  @ApiProperty({
    example: 'gmail/facebook/apple/twitter',
  })
  @IsEnum(SOCIAL_TYPE)
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

  @IsOptional()
  @IsMongoId({ message: 'Something went wrong !' })
  @ApiProperty({
    example: '59a3c559891d70748ead0e73',
  })
  referralCode: string;

  @IsNotEmpty({
    message:
      'Something went wrong ! Your Phone is allowing to get device token!',
  })
  @ApiProperty({
    example: 'CDDA56739701593CBB44F3359B6C49DD0B4ABF2286946352802B71DC03AAE2E3',
    required: true,
  })
  deviceToken: string;

  @IsOptional({
    message:
      'Something went wrong ! Your Phone is allowing to get device voip token!',
  })
  @ApiProperty({
    example: '0ac2694a8dfba8901f550254cfef6f7ef5e2dbbfc4c29c450db69a22c404cfd2',
  })
  voipToken: string;

  @IsOptional()
  @ApiProperty({
    example: 'bio',
  })
  profileDetails: string;
}

export class SignUpDto {
  @IsNotEmpty({ message: 'Please enter your name.' })
  @Transform(({ value }) => value?.trim(), { toClassOnly: true })
  @ApiProperty({
    example: 'Developer Rock!',
    required: true,
  })
  fullName: string;

  @IsOptional()
  @Matches(/^\d+$/, { message: 'Phone Number should be number' })
  @Length(4, 16, { message: 'Phone number must be between 4 and 16 digits.' })
  @Transform(({ value }) => value?.trim(), { toClassOnly: true })
  @ApiProperty({
    example: '9876543210',
  })
  phone: string;

  @IsOptional()
  @Matches(/^\+(\d{1}\-)?(\d{1,4})$/, {
    message:
      'Country code must start with + and be between 0 and 4 digits long.',
  })
  @Transform(({ value }) => value?.trim(), { toClassOnly: true })
  @ApiPropertyOptional({
    example: '+91',
  })
  countryCode: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim(), { toClassOnly: true })
  @ApiProperty({
    example: '+919876543210',
  })
  formattedMobile: string;

  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/,
    {
      message:
        'Password atleast 8 char one small, capital, special chatarter and one number.',
    },
  )
  @IsNotEmpty({ message: 'Please enter your password.' })
  @ValidateIf((o) => o.source == 'email')
  @ApiProperty({
    example: 'Oyraa@1234',
    required: true,
  })
  password: string;

  @IsNotEmpty({ message: 'Please enter your email.' })
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  @Transform(({ value }) => value?.trim().toLowerCase(), { toClassOnly: true })
  @ApiProperty({
    example: 'developer@yopmail.com',
  })
  email: string;

  @IsNotEmpty({ message: 'Please enter your gender.' })
  @ApiProperty({
    example: 'male/female/other',
    required: true,
  })
  @IsEnum(GENDER)
  gender: string;

  @IsNotEmpty({ message: 'Please select any country.' })
  @IsMongoId({ message: 'Something went wrong !' })
  @ApiProperty({
    example: '59ca2eb54c5b0874203b7676',
    required: true,
  })
  countryId: string;

  @IsNotEmpty({ message: 'Please select any city.' })
  @IsMongoId({ message: 'Something went wrong !' })
  @ApiProperty({
    example: '59c8ba74c0d97628bf7fec34',
    required: true,
  })
  cityId: string;

  @IsOptional()
  @ApiProperty({
    example: '59ca2eb54c5b0874203b7676',
  })
  prefectureId: string;

  @IsNotEmpty({
    message:
      'Please enter your Native languages. You have to select at least one Language.',
  })
  @ArrayNotEmpty({
    message: 'The list must have at least one native languages',
  })
  @ApiProperty({
    example: ['59a3c559891d70748ead0e73'],
    required: true,
  })
  nativeLanguages: [];

  @IsNotEmpty({ message: 'Please enter your Preferred Currency' })
  @ApiProperty({
    example: 'JPY',
    required: true,
  })
  preferredCurrency: string;

  @IsOptional()
  @Matches(/\.(jpg|jpeg|png|gif)$/i, {
    message: 'Invalid image extension. Allowed formats: jpg, jpeg, png, gif.',
  })
  @ApiProperty({
    example: 'users/image.jpg',
  })
  photo: string;

  @IsOptional()
  @ApiProperty({
    example: '59a3c559891d70748ead0e73',
  })
  referralCode: string;

  @IsNotEmpty({ message: 'Please accept your Policy and Terms conditions.' })
  @ApiProperty({
    example: true,
    required: true,
  })
  isPTFlag: boolean;

  @IsNotEmpty({ message: 'Please accept your Data Protection policy.' })
  @ApiProperty({
    example: true,
    required: true,
  })
  gdprAccepted: boolean;

  @IsNotEmpty({ message: 'Please enter a valid source of registration' })
  @ApiProperty({
    example: 'email/social',
    required: true,
    enum: SOURCE,
  })
  @IsEnum(SOURCE)
  source: string;

  @IsNotEmpty({ message: 'Please enter a valid social identity.' })
  @ValidateIf((o) => o.source == 'social')
  @ApiProperty({
    example: 'socialId',
  })
  socialId: string;

  @IsNotEmpty({ message: 'Please select a valid social type.' })
  @ValidateIf((o) => o.source === 'social')
  @IsEnum(SOCIAL_TYPE)
  @ApiProperty({
    example: 'gmail/facebook/apple/twitter',
  })
  socialType: string;

  @IsNotEmpty({ message: 'Please enter a valid timezone' })
  @ApiProperty({
    example: 'Asia/Kolkata',
  })
  timezone: string;

  @IsOptional({
    message:
      'Something went wrong ! Your Phone is allowing to get device voip token!',
  })
  @ApiProperty({
    example: '0ac2694a8dfba8901f550254cfef6f7ef5e2dbbfc4c29c450db69a22c404cfd2',
  })
  voipToken: string;

  @IsNotEmpty({
    message:
      'Something went wrong ! Your Phone is allowing to get device token!',
  })
  @ApiProperty({
    example: 'CDDA56739701593CBB44F3359B6C49DD0B4ABF2286946352802B71DC03AAE2E3',
  })
  deviceToken: string;
}

export class VerifyReferralCodeDto {
  @IsNotEmpty({ message: 'Please enter a valid referral code.' })
  @Transform(({ value }) => value?.trim(), { toClassOnly: true })
  @ApiProperty({
    example: 'FREE50',
    required: true,
  })
  code: string;
}

export class VerifyEmailDto {
  @IsNotEmpty({ message: 'Please enter email' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @Transform(({ value }) => value?.trim().toLowerCase(), { toClassOnly: true })
  @ApiProperty({
    example: 'developer@yopmail.com',
  })
  email: string;
}

export class SocialLoginDataDto {
  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @Transform(({ value }) => value?.trim().toLowerCase(), { toClassOnly: true })
  @ApiProperty({
    example: 'developer@yopmail.com',
  })
  email: string;

  @IsOptional()
  @ApiProperty({
    example: '85677464356456346564',
    required: true,
  })
  socialId?: string;

  @IsOptional()
  @ApiProperty({
    example: 'facebook',
    required: true,
  })
  socialType?: string; //TODO USE ENUM WITH
}

export class DataCollectionsUpdateDto {
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
  @IsEnum(ANALYSIS_SCREEN_TYPE)
  type: string;
}

export class ResetPasswordDto {
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/,
    {
      message:
        'Password atleast 8 char one capital, one special chatarter and one number.',
    },
  )
  @IsNotEmpty({ message: 'Please enter password' })
  @ApiProperty({
    example: 'password',
  })
  password: string;

  @IsNotEmpty({ message: 'Please enter token url' })
  @ApiProperty({
    example: 'token of url',
  })
  token: string;
}
