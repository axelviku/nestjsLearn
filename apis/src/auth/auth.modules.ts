import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Twilio } from 'twilio';

import { AuthController } from './auth.controller';

import { AuthService } from './auth.service';
import { ResponseService } from 'common/services/response.service';
import { AppService } from '../app.service';
import { UtilityService } from 'common/utils/utils.service';
import { S3Service } from 'common/utils/s3.service';
import { StripeService } from 'common/utils/stripe.service';
import { EmailService } from 'common/email/email.service';
import { TwilioService } from 'common/utils/twilio.service';
import { CommonService } from 'common/utils/common.services';
import { MyLogger } from '../my-logger.service';
import { SNSService } from 'common/sns';

import { UserSchema } from 'common/schemas/user.schema';
import { ReferralCodeSchema } from 'common/schemas/referralCode.schema';
import { RequestOtpSchema } from 'common/schemas/requestOtp.schema';
import { LanguageSchema } from 'common/schemas/language.schema';
import { CountrySchema } from 'common/schemas/country.schema';
import { ExpertiseSchema } from 'common/schemas/expertise.schema';
import { CurrencySchema } from 'common/schemas/currency.schema';
import { UserRoleSchema } from 'common/schemas/userRole.schema';
import { SettingSchema } from 'common/schemas/setting.schema';
import { EmailTemplateSchema } from 'common/schemas/emailTemplate.schema';
import { TransactionSchema } from 'common/schemas/transaction.schema';

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
      { name: 'Transaction', schema: TransactionSchema },
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
