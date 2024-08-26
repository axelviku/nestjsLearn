import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ResponseService } from 'common/services/response.service';
import { UserSchema } from 'common/schemas/user.schema';
import { AppService } from '../app.service';
import { UserRoleSchema } from 'common/schemas/userRole.schema';
import { RequestOtpSchema } from 'common/schemas/requestOtp.schema';

import { UtilityService } from 'common/utils/utils.service';
import { S3Service } from 'common/utils/s3.service';
import { MyLogger } from '../my-logger.service';
import { CommonService } from 'common/utils/common.services';
import { SNSService } from 'common/sns';
import { EmailService } from 'common/email/email.service';
import { EmailTemplateSchema } from 'common/schemas/emailTemplate.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'UserRole', schema: UserRoleSchema },
      { name: 'RequestOtp', schema: RequestOtpSchema },
      { name: 'EmailTemplate', schema: EmailTemplateSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [
    AppService,
    UserService,
    ResponseService,
    UtilityService,
    S3Service,
    MyLogger,
    CommonService,
    SNSService,
    EmailService,
  ],
})
export class UserModule {}
