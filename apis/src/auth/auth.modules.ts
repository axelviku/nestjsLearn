import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ResponseService } from 'common/services/response.service';
import { AppService } from '../app.service';
import { UtilityService } from 'common/utils/utils.service';
import { S3Service } from 'common/utils/s3.service';
import { JwtModule } from '@nestjs/jwt';
import { StripeService } from 'common/stripe.service';
import { EmailService } from 'common/email/email.service';


@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([
   
    ]),
  ],
  controllers: [
    AuthController
  ],
  providers: [
    AppService,
    AuthService,
    ResponseService,
    UtilityService,
    S3Service,
    EmailService,
    StripeService  
  ],
})
export class AuthModule {}
