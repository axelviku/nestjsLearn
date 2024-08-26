import { Injectable } from '@nestjs/common';
import { SNS } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { constant } from 'common/constant/constant';
import { MyLogger } from 'apis/src/my-logger.service';

@Injectable()
export class SNSService {
  private snsClient: SNS;
  public app_env: 'sandbox';

  constructor(
    private configService: ConfigService,
    private readonly logger: MyLogger,
  ) {
    this.snsClient = new SNS({
      region: this.configService.get<string>('AWS_S3_REGION'),
      accessKeyId: this.configService.get<string>('AWS_S3_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>(
        'AWS_S3_SECRET_ACCESS_KEY',
      ),
    });
  }

  async createPlatformEndpoint(platformApplicationArn: string, token: string) {
    const params = {
      PlatformApplicationArn: platformApplicationArn,
      Token: token,
    };
    try {
      const result = await this.snsClient
        .createPlatformEndpoint(params)
        .promise();
      this.logger.log('createPlatformEndpoint====> Result : ', result);
      return result;
    } catch (error) {
      this.logger.error('createPlatformEndpoint====> Error :', error);
      throw error;
    }
  }

  async deleteEndpoint(endpointArn: string) {
    const params = {
      EndpointArn: endpointArn,
    };
    try {
      const result = await this.snsClient.deleteEndpoint(params).promise();
      this.logger.log('deleteEndpoint====> Result : ', result);
      return { status: true };
    } catch (error) {
      this.logger.error('deleteEndpoint====> Error :', error);
      return { status: false };
    }
  }

  async createEndpointWithDelete(data: any, oldData: any, os: string) {
    this.logger.log('createEndpointWithDelete====> data : ', data);
    this.logger.log('createEndpointWithDelete====> oldData : ', oldData);
    this.logger.log('createEndpointWithDelete====> os : ', os);
    const deviceToken =
      data.token == '' || data.token != undefined ? data.token : '';
    const voipToken =
      data.voip == '' || data.voip != undefined ? data.voip : '';
    const oldDeviceToken = oldData.token;
    const oldVoipToken =
      oldData.voip == '' || oldData.voip != undefined ? oldData.voip : '';

    let applicationArn = '';
    let voipArn = '';
    let newArnToken = {};
    let newVoipToken = {};
    const app_env = process.env.PUSH_ENVIRONMENT;

    if (os == constant.ANDROID) {
      applicationArn = process.env.GCM_ARN;
    } else {
      if (app_env == process.env.PUSH_ENVIRONMENT) {
        applicationArn = process.env.APN_ARN_SANDBOX;
        voipArn = process.env.VOIP_ARN_SANDBOX;
      } else {
        applicationArn = process.env.APN_ARN_PRODUCTION;
        voipArn = process.env.VOIP_ARN_PRODUCTION;
      }
    }
    try {
      if (oldDeviceToken) {
        await this.deleteEndpoint(oldDeviceToken);
      }
      if (oldVoipToken) {
        await this.deleteEndpoint(oldVoipToken);
      }
      if (deviceToken) {
        //create new arn end point
        const paramsArn = {
          PlatformApplicationArn: applicationArn,
          Token: deviceToken,
        };

        newArnToken = await this.snsClient
          .createPlatformEndpoint(paramsArn)
          .promise();
      }
      if (voipToken) {
        //create new voip end point
        const paramsVoip = {
          PlatformApplicationArn: voipArn,
          Token: voipToken,
        };

        newVoipToken = await this.snsClient
          .createPlatformEndpoint(paramsVoip)
          .promise();
      }
      return { voip: newVoipToken, arn: newArnToken };
    } catch (error) {
      this.logger.error('createEndpointWithDelete====> error : ', error);
      throw error;
    }
  }
}
