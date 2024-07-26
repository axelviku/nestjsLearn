import { Module } from '@nestjs/common';
import { UtilController } from './util.controller';
import { UtilService } from './util.service';
import { S3Service } from 'common/utils/s3.service';
import { ResponseService } from 'common/services/response.service';
import { AppService } from '../app.service';

@Module({
  controllers: [UtilController],
  providers: [UtilService, S3Service, ResponseService, AppService],
})
export class UtilModule {}
