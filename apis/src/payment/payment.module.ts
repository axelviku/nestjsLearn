import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ResponseService } from 'common/services/response.service';
import { AppService } from '../app.service';
import { MyLogger } from '../my-logger.service';
import { StripeService } from 'common/utils/stripe.service';
import { UtilityService } from 'common/utils/utils.service';
import { EmailService } from 'common/email/email.service';
import { PushNotificationService } from 'common/utils/notification.service';

import { UserSchema } from 'common/schemas/user.schema';
import { TransactionSchema } from 'common/schemas/transaction.schema';
import { QuickPaySchema } from 'common/schemas/quickpay.schema';
import { EmailTemplateSchema } from 'common/schemas/emailTemplate.schema';
import { NotificationErrorSchema } from 'common/schemas/notificationErr.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'User', schema: UserSchema },
    { name: 'Transaction', schema: TransactionSchema },
    { name: 'QuickPay', schema: QuickPaySchema },
    { name: 'EmailTemplate', schema: EmailTemplateSchema },
    { name: 'NotificationError', schema: NotificationErrorSchema }
  ])],
  controllers: [PaymentController],
  providers: [AppService, PaymentService, ResponseService, MyLogger, StripeService, UtilityService, EmailService,PushNotificationService],
})
export class PaymentModule {}
