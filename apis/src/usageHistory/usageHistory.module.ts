import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsageHistoryService } from './usageHistory.service';
import { UsageHistoryController } from './usageHistory.controller';
import { ResponseService } from 'common/services/response.service';
import { AppService } from '../app.service';
import { MyLogger } from '../my-logger.service';

import { UserSchema } from 'common/schemas/user.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  controllers: [UsageHistoryController],
  providers: [AppService, UsageHistoryService, ResponseService, MyLogger],
})
export class UsageHistoryModule {}
