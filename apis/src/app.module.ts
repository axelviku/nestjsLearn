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

import { UserService } from './user/user.service';
import { AppService } from './app.service';
import { StripeService } from 'common/stripe.service';
import { AuthService } from './auth/auth.service';
import { CountrySchema } from 'common/schemas/country.schema';
import { CitySchema } from 'common/schemas/city.schema';
import { ResourcesModule } from './resources/resources.module';
import { UserSchema } from 'common/schemas/user.schema';
import { RequestOtpSchema } from 'common/schemas/requestOtp.schema';
import { MyLogger } from './my-logger.service';
import { TwilioService } from 'common/utils/twilio.service';

import {
  CorsMiddleware,
  HelmetMiddleware,
  RequiredHeaderMiddleware,
} from 'common/middlewares';
import {
  ReferralCode,
  ReferralCodeSchema,
} from 'common/schemas/referralCode.schema';
import { UtilModule } from './util/util.module';
import { LanguageSchema } from 'common/schemas/language.schema';
import { ExpertiseSchema } from 'common/schemas/expertise.schema';
import { PrefectureSchema } from 'common/schemas/prefecture.schema';
import { CommonService } from 'common/utils/common.services';
import { UserRoleSchema } from 'common/schemas/userRole.schema';
import { DataCollectionAndAnalysisSchema } from 'common/schemas/dataCollectionAndAnalysis.schema';
import { SettingSchema } from 'common/schemas/settings.schema';

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
      {
        name: 'DataCollectionAndAnalysis',
        schema: DataCollectionAndAnalysisSchema,
      },
      { name: 'Prefecture', schema: PrefectureSchema },
      { name: 'Setting', schema: SettingSchema },
    ]),
    AuthModule,
    UserModule,
    ResourcesModule,
    UtilModule,
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
  ],
})

// export class AppModule {}
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware, HelmetMiddleware).forRoutes('*');
    consumer
      .apply(RequiredHeaderMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
