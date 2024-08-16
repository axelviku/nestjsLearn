import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ResponseService } from 'common/services/response.service';
import { UserSchema } from 'common/schemas/user.schema';
import { AppService } from '../app.service';

import { UtilityService } from 'common/utils/utils.service';
import { S3Service } from 'common/utils/s3.service';
import { MyLogger } from '../my-logger.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  controllers: [UserController],
  providers: [
    AppService,
    UserService,
    ResponseService,
    UtilityService,
    S3Service,
    MyLogger,
  ],
})
export class UserModule {}
