/** nest lib imports here */
import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Twilio } from 'twilio';
import { AgendaModule } from 'common/agenda/agenda.module';

/** utility service imports here */
import { UtilityService } from 'common/utils/utils.service';
import { EmailService } from 'common/email/email.service';
/** aws s3 imports here */
import { S3Service } from 'common/utils/s3.service';
import { MongooseDbModule } from 'common/dbconfig/mongoose.module';
import { ResponseService } from 'common/services/response.service';
import { LanguageModule } from '../../common/language/language.module';

/** Apis files imports here */

import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.modules';

import { UserModule } from './user/user.module';
import { HomeModule } from './home/home.module';

import { UserService } from './user/user.service';
import { AppService } from './app.service';
import { StripeService } from 'common/utils/stripe.service';
import { AuthService } from './auth/auth.service';
import { CountrySchema } from 'common/schemas/country.schema';
import { CitySchema } from 'common/schemas/city.schema';
import { ResourcesModule } from './resources/resources.module';
import { UserSchema } from 'common/schemas/user.schema';
import { RequestOtpSchema } from 'common/schemas/requestOtp.schema';
import { EmailTemplateSchema } from 'common/schemas/emailTemplate.schema';
import { FeedbackInquirySchema } from 'common/schemas/feedbackInquiry.schema';
import { MyLogger } from './my-logger.service';
import { TwilioService } from 'common/utils/twilio.service';
import { SNSService } from 'common/sns';
import { CurrencyService } from 'common/utils/currency.services';

import {
  CorsMiddleware,
  HelmetMiddleware,
  RequiredHeaderMiddleware,
} from 'common/middlewares';
import {
  CurrencyHistorySchema,
} from 'common/schemas/currencyHistory.schema';
import { Currency, CurrencySchema } from 'common/schemas/currency.schema';
import {
  ReferralCodeSchema,
} from 'common/schemas/referralCode.schema';
import { UtilModule } from './util/util.module';
import { LanguageSchema } from 'common/schemas/language.schema';
import { ExpertiseSchema } from 'common/schemas/expertise.schema';
import { PrefectureSchema } from 'common/schemas/prefecture.schema';
import { CommonService } from 'common/utils/common.services';
import { UserRoleSchema } from 'common/schemas/userRole.schema';
import { SettingSchema } from 'common/schemas/setting.schema';
import { CoverageSchema } from 'common/schemas/coverage.schema';
import { HomeService } from './home/home.service';
import { InterpreterService } from './interpreter/interpreter.service';
import { InterpreterModule } from './interpreter/interpreter.module';
import { NotificationService } from './notification/notification.service';
import { NotificationModule } from './notification/notification.module';
import { ChatModule } from './chat/chat.module';
import { ChatService } from './chat/chat.service';
import { FavouriteModule } from './favourite/favourite.module';
import { FavouriteService } from './favourite/favourite.service';
import { SettingModule } from './setting/setting.module';
import { SettingService } from './setting/setting.service';
import { UsageHistoryModule } from './usageHistory/usageHistory.module';
import { UsageHistoryService } from './usageHistory/usageHistory.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
    LanguageModule,
    MongooseDbModule,
    MongooseModule.forFeature([
      { name: 'Country', schema: CountrySchema },
      { name: 'City', schema: CitySchema },
      { name: 'User', schema: UserSchema },
      { name: 'ReferralCode', schema: ReferralCodeSchema },
      { name: 'RequestOtp', schema: RequestOtpSchema },
      { name: 'Language', schema: LanguageSchema },
      { name: 'Expertise', schema: ExpertiseSchema },
      { name: 'UserRole', schema: UserRoleSchema },
      { name: 'Setting', schema: SettingSchema },
      { name: 'Currency', schema: CurrencySchema },
      { name: 'Prefecture', schema: PrefectureSchema },
      { name: 'Setting', schema: SettingSchema },
      { name: 'CurrencyHistory', schema: CurrencyHistorySchema },
      { name: 'EmailTemplate', schema: EmailTemplateSchema },
      { name: 'FeedbackInquiry', schema: FeedbackInquirySchema },
      { name: 'Coverage', schema: CoverageSchema },
    ]),
    AuthModule,
    UserModule,
    ResourcesModule,
    UtilModule,
    HomeModule,
    AgendaModule,
    InterpreterModule,
    NotificationModule,
    ChatModule,
    FavouriteModule,
    SettingModule,
    UsageHistoryModule,
  ],
  controllers: [AppController],
  providers: [
    ConfigService,
    AuthService,
    AppService,
    UtilityService,
    ResponseService,
    S3Service,
    UserService,
    EmailService,
    StripeService,
    Twilio,
    TwilioService,
    MyLogger,
    CommonService,
    SNSService,
    HomeService,
    InterpreterService,
    NotificationService,
    ChatService,
    FavouriteService,
    SettingService,
    CurrencyService,
    UsageHistoryService,
  ],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware, HelmetMiddleware).forRoutes('*');

    consumer
      .apply(RequiredHeaderMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    consumer
      .apply(CurrencyService)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
