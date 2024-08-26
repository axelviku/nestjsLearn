import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CallHistoryService } from './callHistory.service';
import { CallHistoryController } from './callHistory.controller';
import { ResponseService } from 'common/services/response.service';
import { AppService } from '../app.service';
import { MyLogger } from '../my-logger.service';

import { UserSchema } from 'common/schemas/user.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  controllers: [CallHistoryController],
  providers: [AppService, CallHistoryService, ResponseService, MyLogger],
})
export class CallHistoryModule {}
