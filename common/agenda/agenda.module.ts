// agenda.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AgendaService } from './agenda.service';
import { Currency, CurrencySchema } from '../schemas/currency.schema';
import { User } from 'common/schemas/user.schema';
import { Coverage } from 'common/schemas/coverage.schema';
import { UserRoleSchema, UserRole } from 'common/schemas/userRole.schema';
import { RequestOtp, RequestOtpSchema } from 'common/schemas/requestOtp.schema';
import {
  CurrencyHistory,
  CurrencyHistorySchema,
} from '../schemas/currencyHistory.schema';
import { MyLogger } from 'apis/src/my-logger.service';
import { CommonService } from 'common/utils/common.services';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Currency.name, schema: CurrencySchema },
      { name: CurrencyHistory.name, schema: CurrencyHistorySchema },
      { name: User.name, schema: User },
      { name: Coverage.name, schema: Coverage },
      { name: UserRole.name, schema: UserRoleSchema },
      { name: RequestOtp.name, schema: RequestOtpSchema },
    ]),
  ],
  providers: [AgendaService, MyLogger, CommonService],
  exports: [AgendaService],
})
export class AgendaModule {}
