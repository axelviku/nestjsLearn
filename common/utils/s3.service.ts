import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as moment from 'moment'

@Injectable()
export class S3Service {
    private s3: AWS.S3;

    constructor() {
        const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY;
        const region = process.env.AWS_S3_REGION;
        const awsConfig = {
            accessKeyId,
            secretAccessKey,
            region,
            apiVersion: '2006-03-01',
            signatureVersion: 'v4',
            ACL: 'public-read',
        };
        AWS.config.update(awsConfig);

        this.s3 = new AWS.S3({
            sslEnabled: true
        }); 

    }

    async getSignedUrl(location, extension) {

        const key = `${location}/${this.randomString(10)}.${extension}`;

        return new Promise((resolve, reject) => {
            this.s3.getSignedUrl('putObject', {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: key,
                    ACL: 'public-read',
                },(err, data) => {
                    if (err) return reject(err);
                    resolve({
                        url: data,
                        preview: `${process.env.AWS_S3_BASE}${key}`,
                        filePath: `${key}`,
                    });
                }
            );
        });
    }

    randomString(length = 30, charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
        let randomString = '';
        for (let i = 0; i < length; i++) {
            const randomPoz = Math.floor(Math.random() * charSet.length);
            randomString += charSet.substring(randomPoz, randomPoz + 1);
        }
        return `${moment.utc().unix()}-${randomString}`
    }
    

    // Add more methods as needed, such as downloading files, listing objects, etc.
}