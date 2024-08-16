import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InterpreterService } from './interpreter.service';
import { InterpreterController } from './interpreter.controller';
import { ResponseService } from 'common/services/response.service';
import { AppService } from '../app.service';
import { MyLogger } from '../my-logger.service';
import { UtilityService } from 'common/utils/utils.service';
import { UserSchema } from 'common/schemas/user.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  controllers: [InterpreterController],
  providers: [
    AppService,
    InterpreterService,
    ResponseService,
    MyLogger,
    UtilityService,
  ],
})
export class InterpreterModule {}
