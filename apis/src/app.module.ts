/** nest lib imports here */
import { Module, NestModule, MiddlewareConsumer, RequestMethod, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import * as path from 'path';
/** utility service imports here */
import { UtilityService } from 'common/utils/utils.service';
import { EmailService } from 'common/email/email.service';
/** aws s3 imports here */
import { S3Service } from 'common/utils/s3.service';
import { MongooseDbModule } from 'common/dbconfig/mongoose.module';
import { ResponseService } from 'common/services/response.service';
import { LanguageModule } from 'common/language/language.module';

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
    ]),
    AuthModule,
    UserModule,
    ResourcesModule,
  ],
  controllers: [
    AppController,
  ],
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
  ],
})

// export class AppModule {}
export class AppModule implements OnModuleInit {
  onModuleInit() {
    if (admin.apps.length === 0) {
      const serviceAccountPath = path.resolve('./common/fcmAccountKey.json');
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase initialized in AppModule');
    }
  }
}