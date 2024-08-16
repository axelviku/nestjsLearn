import { Injectable } from '@nestjs/common';
import { S3Service } from 'common/utils/s3.service';

@Injectable()
export class UtilService {
  constructor(private readonly S3Service: S3Service) {}

  async sighUpAwsUrl(type, extension) {
    return await this.S3Service.getSignedUrl(type, extension);
  }
}
