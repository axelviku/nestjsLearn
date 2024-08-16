import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ResponseService } from 'common/services/response.service';
import { AppService } from '../app.service';
import { UtilityService } from 'common/utils/utils.service';
import { S3Service } from 'common/utils/s3.service';
import { JwtModule } from '@nestjs/jwt';
import { StripeService } from 'common/utils/stripe.service';
import { EmailService } from 'common/email/email.service';
import { UserSchema } from 'common/schemas/user.schema';
import { Twilio } from 'twilio';
import { ReferralCodeSchema } from 'common/schemas/referralCode.schema';
import { RequestOtpSchema } from 'common/schemas/requestOtp.schema';
import { LanguageSchema } from 'common/schemas/language.schema';
import { CountrySchema } from 'common/schemas/country.schema';
import { TwilioService } from 'common/utils/twilio.service';
import { ExpertiseSchema } from 'common/schemas/expertise.schema';
import { CurrencySchema } from 'common/schemas/currency.schema';
import { CommonService } from 'common/utils/common.services';
import { UserRoleSchema } from 'common/schemas/userRole.schema';
import { SettingSchema } from 'common/schemas/setting.schema';
import { EmailTemplateSchema } from 'common/schemas/emailTemplate.schema';
import { MyLogger } from '../my-logger.service';
import { SNSService } from 'common/sns';

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'ReferralCode', schema: ReferralCodeSchema },
      { name: 'RequestOtp', schema: RequestOtpSchema },
      { name: 'Language', schema: LanguageSchema },
      { name: 'Country', schema: CountrySchema },
      { name: 'Expertise', schema: ExpertiseSchema },
      { name: 'UserRole', schema: UserRoleSchema },
      { name: 'Setting', schema: SettingSchema },
      { name: 'Currency', schema: CurrencySchema },
      {
        name: 'EmailTemplate',
        schema: EmailTemplateSchema,
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AppService,
    AuthService,
    ResponseService,
    UtilityService,
    S3Service,
    EmailService,
    StripeService,
    Twilio,
    TwilioService,
    CommonService,
    MyLogger,
    SNSService,
  ],
})
export class AuthModule {}
