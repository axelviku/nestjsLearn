import * as AWS from 'aws-sdk';
import { User } from 'common/schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRole } from 'common/schemas/userRole.schema';
import { RequestOtp } from 'common/schemas/requestOtp.schema';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class CommonService {
  private sns: AWS.SNS;
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserRole.name) private readonly userRoleModel: Model<UserRole>,
    @InjectModel(RequestOtp.name)
    private readonly requestOtpModel: Model<RequestOtp>,
    private readonly i18n: I18nService,
  ) {}

  async userDetail(condition: any) {
    return await this.userModel.findOne(condition).populate('roleId');
  }
  async updateUserDetails(where: object, set: object) {
    return await this.userModel.updateOne(where, set);
  }

  async userRole(condition: string) {
    const data = await this.userRoleModel.findOne({ _id: condition });
    return { _id: data?._id, roleName: data?.name, slug: data?.slug };
  }

  async isEmailExist(email: string) {
    const information = await this.userModel.findOne({
      email,
      'status.isActive': true,
      'status.isDeleted': false,
    });

    if (!information) {
      return { status: false, data: {} };
    }
    return { status: true, data: information };
  }

  async isPhoneExist(mobile: string) {
    const information = await this.userModel.findOne({
      mobile,
      'status.isActive': true,
      'status.isDeleted': false,
    });

    if (!information) {
      return { status: false, data: {} };
    }
    return { status: true, data: information };
  }

  async isEmailVerified(email: string) {
    const information = await this.requestOtpModel.findOne({
      'requestOtpType.emailAddress': email,
      isVerified: true,
    });

    if (!information) {
      return { status: false, data: {} };
    }
    return { status: true, data: information };
  }

  async isPhoneVerified(phone: string) {
    const information = await this.requestOtpModel.findOne({
      'requestOtpType.phoneNumber': phone,
      isVerified: true,
    });

    if (!information) {
      return { status: false, data: {} };
    }
    return { status: true, data: information };
  }

  async addHoursInCurrentTime(hours: number) {
    const currentTime = new Date();
    return new Date(currentTime.getTime() + hours * 60 * 60 * 1000);
  }

  async roleData(slugData: string) {
    return await this.userRoleModel
      .findOne({
        slug: slugData,
      })
      .select('_id slug');
  }

  async deleteUserAccountPermanent(userId: string) {
    try {
      const query: any = {
        is_active: false,
        is_selfdelete: true,
        is_Deleted: false,
      };

      if (userId && userId !== '') {
        query._id = userId;
      } else {
        const date = new Date();
        date.setDate(date.getDate() - 15);
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0); // Start of the day

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999); // End of the day

        query['$and'] = [
          { delete_RequestDate: { $gt: startDate } },
          { delete_RequestDate: { $lt: endDate } },
        ];
      }

      const users = await this.userModel.find(query);

      if (users && users.length > 0) {
        await Promise.all(
          users.map(async (user) => {
            // Add Code of Delete user card data && stripe here

            await this.updateUserDetails(
              { _id: user._id },
              {
                token: {
                  arn: '',
                  voip: '',
                  login: '',
                },
                fullName: 'Oyraa User',
                email: 'oyraauser@yopmail.com',
                userReferralCode: '',
                source: '',
                password: '',
                social: [],
                mobile: '',
                countryCode: '',
                formattedMobile: '',
                personalInfo: {
                  userNo: '',
                  gender: '',
                  photo: '',
                  countryId: '',
                  cityId: '',
                  preferredCurrency: '',
                },
                userNotifications: {
                  isNotify: '',
                  lastNotification: '',
                  badge: '',
                },
                callDetails: {
                  callReceived: 0,
                  callMissed: 0,
                  callPinged: 0,
                  callDialed: 0,
                  missCount: 0,
                  callFailed: 0,
                },
                blockedUsers: [],
                nativeLanguages: [],
                prefectureId: [],
                interpreterInfo: {
                  profileDetails: '',
                  interpretationLanguages: [],
                  expertiseList: [],
                  associations: [],
                  qualification: [],
                  academicBackground: [],
                  interpreterRates: [],
                  responseRate: 0,
                  ratingDetails: {
                    rated: 0,
                    totalRating: 0,
                    avgRating: 0,
                  },
                  professional: {
                    docs: [],
                    isApproved: '',
                    approvedBy: '',
                  },
                },
                enterpriseInfo: '',
                enterpriseCompanyForeigner: {
                  enterprise_company_id: '',
                  japaneseLevel: '',
                  foreigner_location: '',
                  foreginer_working_at: '',
                  staff_designation: '',
                },
                favUsers: [],
                status: {
                  isOnline: false,
                  isLogin: false,
                  isActive: false,
                  isSelfdelete: true,
                  profileStatus: '',
                  lastConnect: '',
                  isAvailableForCall: false,
                  isPTFlag: false,
                  gdprAccepted: false,
                  isProfessional: '',
                  isDeleted: true,
                  deleteRequestDate: '',
                },
                verification: {
                  email: false,
                  phone: false,
                  resetEmail: false,
                  resetPhone: false,
                },
                resetToken: '',
                resetPasswordRequestExpiredAt: '',
                registrationSteps: {
                  emailVerify: false,
                  registerScreen: false,
                  dataAnalysisScreen: false,
                  tutorialScreen: false,
                },
                stripeInfo: {},
                deviceInfo: {
                  os: '',
                  version: '',
                  language: '',
                  deviceVersion: '',
                  deviceName: '',
                  lastConnectedDate: '',
                  timezone: '',
                },
                recentUser: [],
                devicePermissions: {},
              },
            );
          }),
        );
        return { status: true, info: {}, message: 'Done' };
      } else {
        return {
          status: false,
          info: {},
          message: this.i18n.t('lang.USER_NOT_FOUND', { lang: 'en' }),
        };
      }
    } catch (error) {
      return {
        status: false,
        info: {},
        message: error.message,
      };
    }
  }
}
