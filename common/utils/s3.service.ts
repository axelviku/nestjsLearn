import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as moment from 'moment';
import { MyLogger } from '../../apis/src/my-logger.service';

@Injectable()
export class S3Service {
  private s3: AWS.S3;

  constructor(private readonly logger: MyLogger) {
    const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY;
    const region = process.env.AWS_S3_REGION;
    const awsConfig = {
      accessKeyId,
      secretAccessKey,
      region,
      signatureVersion: 'v4',
      ACL: 'public-read',
    };
    AWS.config.update(awsConfig);
    this.s3 = new AWS.S3({
      sslEnabled: true,
    });
  }

  async getSignedUrl(location, extension) {
    const fileName = `${this.randomString(10)}.${extension}`;
    const key = `${location}/${fileName}`;

    return new Promise((resolve, reject) => {
      this.s3.getSignedUrl(
        'putObject',
        {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: key,
        },
        (error, data) => {
          if (error) {
            this.logger.error('getSignedUrl =====> Error : ', error);
            return reject(error);
          }
          if (!data) {
            this.logger.warn('getSignedUrl =====> Not updated ! ');
            return reject(null);
          }
          if (data) {
            this.logger.log(
              `getSignedUrl =====> File Preview  : ${process.env.AWS_S3_BASE}${key}`,
            );
            resolve({
              url: data,
              preview: `${process.env.AWS_S3_BASE}${key}`,
              filePath: `${key}`,
              fileName: `${fileName}`,
            });
          }
        },
      );
    });
  }

  randomString(
    length = 30,
    charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  ): string {
    let randomString = '';
    for (let i = 0; i < length; i++) {
      const randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz, randomPoz + 1);
    }
    return `${moment.utc().unix()}-${randomString}`;
  }

  async deleteObj(Key) {
    new Promise((resolve) => {
      this.s3.deleteObject(
        {
          Bucket: process.env.AWS_S3_BUCKET,
          Key,
        },
        (error) => {
          if (error) {
            console.log('Error in uploading file: ', error);
            resolve(false);
          }
          resolve(true);
        }
      );
    });
  }




}
