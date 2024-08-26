import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobPostingService } from './jobPosting.service';
import { JobPostingController } from './jobPosting.controller';
import { ResponseService } from 'common/services/response.service';
import { AppService } from '../app.service';
import { MyLogger } from '../my-logger.service';

import { UserSchema } from 'common/schemas/user.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  controllers: [JobPostingController],
  providers: [AppService, JobPostingService, ResponseService, MyLogger],
})
export class JobPostingModule {}
