import * as AWS from 'aws-sdk';
import { User } from 'common/schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { UtilityService } from './utils.service';
import { ReferralCode } from 'common/schemas/referralCode.schema';
import { Language } from 'common/schemas/language.schema';
import { Country } from 'common/schemas/country.schema';
import { Expertise } from 'common/schemas/expertise.schema';
import { UserRole } from 'common/schemas/userRole.schema';
import { permission } from 'process';

@Injectable()
export class CommonService {
  private sns: AWS.SNS;
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(ReferralCode.name) private referalModel: Model<ReferralCode>,
    @InjectModel(Language.name) private readonly languageModel: Model<Language>,
    @InjectModel(Country.name) private readonly countryModel: Model<Country>,
    @InjectModel(Expertise.name)
    private readonly expertiseModel: Model<Expertise>,
    @InjectModel(UserRole.name) private readonly userRoleModel: Model<UserRole>,
    private readonly configService: ConfigService,
    private readonly utilService: UtilityService,
  ) {
    AWS.config.update({ region: process.env.AWS_REGION });
    this.sns = new AWS.SNS();
    this.sns = new AWS.SNS({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  // fetch user detail by passing condition
  async userDetail(condition: any) {
    return await this.userModel.findOne(condition);
  }

  // fetch user role by passing condition
  async userRole(condition: string) {
    const data = await this.userRoleModel.findOne({ _id: condition });
    return { _id: data._id, roleName: data.name, slug: data.slug };
  }

  async createEndpoint(
    os: string,
    app_env: string,
    deviceToken: string,
    voip_deviceToken: string,
  ): Promise<{ deviceEndpointArn: string; voipEndpointArn: string }> {
    if (deviceToken && deviceToken !== '') {
      let applicationArn: string;
      let voipArn: string;

      if (os === 'android') {
        applicationArn = process.env.GCM_ARN;
      } else {
        if (app_env === 'sandbox') {
          applicationArn = process.env.APN_ARN_SANDBOX;
          voipArn = process.env.VOIP_ARN_SANDBOX;
        } else {
          applicationArn = process.env.APN_ARN_PRODUCTION;
          voipArn = process.env.VOIP_ARN_PRODUCTION;
        }
      }

      try {
        const deviceEndpointData = await this.sns
          .createPlatformEndpoint({
            PlatformApplicationArn: applicationArn,
            Token: deviceToken,
          })
          .promise();

        if (os === 'ios' && voip_deviceToken && voip_deviceToken !== '') {
          try {
            const voipEndpointData = await this.sns
              .createPlatformEndpoint({
                PlatformApplicationArn: voipArn,
                Token: voip_deviceToken,
              })
              .promise();

            return {
              deviceEndpointArn: deviceEndpointData.EndpointArn,
              voipEndpointArn: voipEndpointData.EndpointArn,
            };
          } catch (voipErr) {
            console.log('err in sns', voipErr);
            return {
              deviceEndpointArn: deviceEndpointData.EndpointArn,
              voipEndpointArn: '',
            };
          }
        } else {
          return {
            deviceEndpointArn: deviceEndpointData.EndpointArn,
            voipEndpointArn: '',
          };
        }
      } catch (err) {
        console.log('err in sns', err);
        return {
          deviceEndpointArn: '',
          voipEndpointArn: '',
        };
      }
    } else {
      return {
        deviceEndpointArn: '',
        voipEndpointArn: '',
      };
    }
  }

  async deleteEndpoint(arn: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (arn && arn !== '') {
        this.sns.deleteEndpoint(
          {
            EndpointArn: arn,
          },
          (err, data) => {
            if (err) {
              console.error('deleteEndpoint error:', err);
              reject(err);
            } else {
              console.log('Deleted endpoint:', arn);
              resolve();
            }
          },
        );
      } else {
        resolve();
      }
    });
  }

  async removeOldEndPoint(user_id: string): Promise<void> {
    try {
      const logindata = await this.userModel
        .findOne({
          _id: user_id,
          is_active: true, // Adjust as per your schema
        })
        .exec();

      if (!logindata) {
        throw new Error('User not found or not active');
      }

      await this.deleteEndpoint(logindata.token.arn);

      if (logindata.token.voip && logindata.token.voip !== '') {
        await this.deleteEndpoint(logindata.token.voip);
      }

      return Promise.resolve(); // Success, endpoints deleted
    } catch (error) {
      console.error('Error removing old endpoints:', error);
      throw error; // Forward the error to the caller
    }
  }

  async postLogin(user_id: string, newdata: any): Promise<any> {
    try {
      const app_env =
        process.env.APP_ENV !== 'production' ? 'sandbox' : 'production';

      // Remove old endpoints
      await this.removeOldEndPoint(user_id);

      const Token = await this.createEndpoint(
        newdata.os,
        app_env,
        newdata.device_token,
        newdata.voip_device_token,
      );

      // Generate login token

      // Update user data
      const updatedUser = await this.userModel
        .findOneAndUpdate(
          { _id: user_id },
          {
            $set: {
              'token.arn': newdata.arn_token,
              'token.voip': newdata.os === 'ios' ? newdata.voip_arn_token : '',
              os: newdata.os,
              'token.login': this.utilService.generateLoginToken(user_id),
              'sttaus.isLogin': true,
              'sttaus.isSelfdelete':
                newdata.gdpr_accepted === true ? false : true,
              counter: 0,
              'sttaus.isAvailableForCall': true,
            },
          },
          {
            new: true,
            fields: {
              full_name: 1,
              email: 1,
              source: 1,
              login_token: 1,
              is_notify: 1,
              arn_token: 1,
              voip_arn_token: 1,
              profile_status: 1,
              email_verified: 1,
              os: 1,
              language: 1,
              is_interpreter: 1,
              is_online: 1,
              is_login: 1,
              rates: 1,
              currency: 1,
              credits: 1,
              earned_credits: 1,
              city: 1,
              user_type: 1,
              photo: 1,
              video: 1,
              video_thumb: 1,
              stripe: 1,
              is_pt_flag: 1,
              gdpr_accepted: 1,
              enterprise_company_id: 1,
              role_id: 1,
              staff_designation: 1,
              foreginer_working_at: 1,
              is_available_for_call: 1,
              user_referral_code: 1,
            },
          },
        )
        .populate('rates.languages');

      // Handle socket.io event
      if (updatedUser.status.isOnline) {
        // this.io.emit('interpreter_status_update', {
        //     user_id: updatedUser._id.toString(),
        //     full_name: updatedUser.full_name,
        //     role_id: updatedUser.role_id,
        //     is_interpreter_online: true,
        //     is_interpreter_login: updatedUser.is_login,
        // });
      }

      // Populate referral code data
      const localObj = updatedUser.toObject();
      // localObj.base_url = this.configService.get<string>('MEDIA_DISPLAY_PATH');
      localObj.userReferralCode = await this.getUserReferralCodeData(
        localObj.userReferralCode,
      );

      return localObj;
    } catch (error) {
      console.error('Error in postLogin:', error);
      throw error;
    }
  }

  private crypto(data: string, operation: string): string {
    // Implement your encryption logic here
    return ''; // Placeholder
  }

  private randomString(length: number): string {
    // Implement your random string generation logic here
    return ''; // Placeholder
  }

  private async getUserReferralCodeData(referral_code: any): Promise<any> {
    if (!referral_code) {
      return {};
    }
    try {
      const result = await this.referalModel.findOne({ _id: referral_code });

      if (result) {
        return {
          _id: result._id,
          type: result.codeType,
          name: result.name,
          description: result.description,
          referral_code: result.referralCode,
          ec_interpreter_associates: result.assignedSpecificInterpreters,
          credit_card: result.isCreditCardShown,
          // is_price_shown: result.is_price_shown,
          // is_tias_interpreter: result.is_tias_interpreter,
        };
      } else {
        return {};
      }
    } catch (error) {
      console.error('Error fetching referral code data:', error);
      return {};
    }
  }

  async getLanguages() {
    return this.languageModel.find({ isActive: true }).sort({ name: 1 }).exec();
  }

  async getDistinctAssociations() {
    return this.userModel.distinct('associations', { is_active: 1 }).exec();
  }

  async getDistinctCertificates() {
    return this.userModel
      .distinct('certificates', { 'sttaus.isActive': 1 })
      .exec();
  }

  async getDistinctEducations() {
    return this.userModel.distinct('educations', { is_active: 1 }).exec();
  }

  async getCountries() {
    return this.countryModel.find({ isActive: true }).sort({ name: 1 }).exec();
  }

  async getExpertise(lang: string) {
    const tempField = lang !== 'en' ? `$name${lang}` : '$name.en';
    return this.expertiseModel
      .aggregate([
        { $match: { status: true, is_deleted: false } },
        { $project: { name: tempField, expertise: [] } },
        { $sort: { name: 1 } },
      ])
      .exec();
  }
  sortByTotal(a, b) {
    return b.total - a.total;
  }

  //verify email exist or not
  async emailExist(email: string) {
    const information = await this.userModel.findOne({
      email,
      status: { isActive: true, isDeleted: false },
      verification: { email: true },
    });

    if (!information) {
      return { status: false, data: {} };
    }
    return { status: true, data: information };
  }
}
