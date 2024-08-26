import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ResponseService } from 'common/services/response.service';
import { AppService } from '../app.service';
import { MyLogger } from '../my-logger.service';
import { StripeService } from 'common/utils/stripe.service';
import { UtilityService } from 'common/utils/utils.service';

import { UserSchema } from 'common/schemas/user.schema';
import { TransactionSchema } from 'common/schemas/transaction.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'User', schema: UserSchema },
    { name: 'Transaction', schema: TransactionSchema }
  ])],
  controllers: [PaymentController],
  providers: [AppService, PaymentService, ResponseService, MyLogger,StripeService,UtilityService],
})
export class PaymentModule {}
