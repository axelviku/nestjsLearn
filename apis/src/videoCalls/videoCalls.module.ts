import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VideoCallsService } from './videoCalls.service';
import { VideoCallsController } from './videoCalls.controller';
import { ResponseService } from 'common/services/response.service';
import { AppService } from '../app.service';
import { Twilio } from 'twilio';

import { UserSchema } from 'common/schemas/user.schema';
import { ReferralCodeSchema } from 'common/schemas/referralCode.schema';
import { SettingSchema } from 'common/schemas/setting.schema';
import { CurrencySchema } from 'common/schemas/currency.schema';
import { UserRoleSchema } from 'common/schemas/userRole.schema';

import { UtilityService } from 'common/utils/utils.service';
import { TwilioService } from 'common/utils/twilio.service';
import { CommonService } from 'common/utils/common.services';
import { MyLogger } from '../my-logger.service';
import { RequestOtpSchema } from 'common/schemas/requestOtp.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'ReferralCode', schema: ReferralCodeSchema },
      { name: 'UserRole', schema: UserRoleSchema },
      { name: 'Setting', schema: SettingSchema },
      { name: 'Currency', schema: CurrencySchema },
      { name: 'RequestOtp', schema: RequestOtpSchema}
    ]),
  ],
  controllers: [VideoCallsController],
  providers: [
    AppService,
    VideoCallsService,
    ResponseService,
    MyLogger,
    UtilityService,
    TwilioService,
    Twilio,
    CommonService,
  ],
})
export class VideoCallsModule {}
