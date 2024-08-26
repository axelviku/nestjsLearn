import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ResponseService } from 'common/services/response.service';
import { AppService } from '../app.service';
import { MyLogger } from '../my-logger.service';
import { SettingService } from './setting.service';
import { EmailService } from 'common/email/email.service';

import { UserSchema } from 'common/schemas/user.schema';
import { SettingSchema } from 'common/schemas/setting.schema';
import { EmailTemplateSchema } from 'common/schemas/emailTemplate.schema';
import { FeedbackInquirySchema } from 'common/schemas/feedbackInquiry.schema';
import { CoverageSchema } from 'common/schemas/coverage.schema';
import { SettingController } from './setting.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Setting', schema: SettingSchema },
      { name: 'EmailTemplate', schema: EmailTemplateSchema },
      { name: 'FeedbackInquiry', schema: FeedbackInquirySchema },
      { name: 'Coverage', schema: CoverageSchema },
    ]),
  ],
  controllers: [SettingController],
  providers: [
    AppService,
    SettingService,
    ResponseService,
    MyLogger,
    EmailService,
  ],
})
export class SettingModule {}
