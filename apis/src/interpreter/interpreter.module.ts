import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InterpreterService } from './interpreter.service';
import { InterpreterController } from './interpreter.controller';
import { ResponseService } from 'common/services/response.service';
import { AppService } from '../app.service';
import { MyLogger } from '../my-logger.service';
import { UtilityService } from 'common/utils/utils.service';
import { UserSchema } from 'common/schemas/user.schema';
import { CommonService } from 'common/utils/common.services';
import { UserRoleSchema } from 'common/schemas/userRole.schema';
import { RequestOtpSchema } from 'common/schemas/requestOtp.schema';
import { ReferralCodeSchema } from 'common/schemas/referralCode.schema';
import { CurrencyService } from 'common/utils/currency.services';
import { CurrencySchema } from 'common/schemas/currency.schema';
import { ReviewSchema } from 'common/schemas/review.schema';
import { S3Service } from 'common/utils/s3.service';




@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'UserRole', schema: UserRoleSchema },
      { name: 'RequestOtp', schema: RequestOtpSchema },
      { name: 'ReferralCode', schema: ReferralCodeSchema },
      { name: 'Currency', schema: CurrencySchema },
      { name: 'Review', schema: ReviewSchema },
    ]),
  ],
  controllers: [InterpreterController],
  providers: [
    AppService,
    InterpreterService,
    ResponseService,
    MyLogger,
    UtilityService,
    CommonService,
    CurrencyService,
    S3Service
  ],
})
export class InterpreterModule {}
