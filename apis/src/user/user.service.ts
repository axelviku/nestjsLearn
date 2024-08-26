import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'common/schemas/user.schema';
import * as mongoose from 'mongoose';
import { Model, Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { UtilityService } from 'common/utils/utils.service';
import { ChangePasswordDto } from './user.dto';
import { MyLogger } from '../my-logger.service';
import { CommonService } from '../../../common/utils/common.services';
import { SNSService } from 'common/sns';
import { EmailService } from 'common/email/email.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly i18n: I18nService,
    private readonly utilityService: UtilityService,
    private readonly logger: MyLogger,
    private readonly commonService: CommonService,
    private readonly sns: SNSService,
    private readonly emailService: EmailService,
  ) {}

  async changePassword(
    language: string,
    changePasswordDto: ChangePasswordDto,
    userId: any,
  ): Promise<object> {
    const { currentPassword, password, newPassword } = changePasswordDto;
    try {
      this.logger.log(`user/changePassword/=====>`);
      if (password !== newPassword) {
        this.logger.warn(`user/changePassword/=====> Password not match!`);
        return {
          status: false,
          info: {},
          message: this.i18n.t('lang.PASSWORD_NOT_MATCH', { lang: language }),
        };
      }
      const userData = await this.userModel.findOne(
        {
          _id: userId,
          'status.isActive': true,
        },
        { password: 1 },
      );
      if (!userData) {
        this.logger.warn(`user/changePassword/=====> User not found!`);
        return {
          status: false,
          info: {},
          message: this.i18n.t('lang.USER_NOT_FOUND', { lang: language }),
        };
      }
      const passwordMatched = await this.utilityService.comparePassword(
        currentPassword,
        userData.password,
      );
      if (!passwordMatched) {
        this.logger.warn(`user/changePassword/=====> Incorrect old password!`);
        return {
          status: false,
          info: {},
          message: this.i18n.t('lang.INCORRECT_OLD_PASSWORD', {
            lang: language,
          }),
        };
      }
      userData.password = newPassword;
      await userData.save();
      return {
        status: true,
        info: {},
        message: this.i18n.t('lang.PASSWORD_CHANGE_SUCCESSFULLY', {
          lang: language,
        }),
      };
    } catch (error) {
      this.logger.error(`user/changePassword/=====> Catch C Error : `, error);
      return {
        status: false,
        info: {},
        message: error.message,
      };
    }
  }

  async getUserProfile(appLanguage: string, userProfileDataDto: any) {
    try {
      const { userId } = userProfileDataDto;
      const userProfileData = await this.userModel
        .findOne({ _id: new mongoose.Types.ObjectId(userId) })
        .select('_id fullName personalInfo status roleId nativeLanguages')
        .populate({
          path: 'personalInfo.countryId',
          select: 'name',
        })
        .populate({
          path: 'personalInfo.cityId',
          select: 'name',
        })
        .populate('nativeLanguages')
        .exec();
      if (userProfileData) {
        const userDetails: any = userProfileData.toObject();
        const userData = {
          _id: userDetails._id,
          fullName: userDetails.fullName,
          roleId: userDetails.roleId,
          gender: userDetails.personalInfo.gender,
          photo:
            userDetails.personalInfo && userDetails.personalInfo.photo
              ? `${process.env.AWS_S3_BASE + userDetails.personalInfo.photo}`
              : '',
          isOnline: userDetails.status.isOnline,
          profileDetails:
            userDetails && userDetails.personalInfo && userDetails.personalInfo
              ? userDetails.personalInfo.profileDetails
              : '',
          countryId:
            userDetails.personalInfo && userDetails.personalInfo.countryId
              ? await this.utilityService.dataMapperObject(
                  userDetails.personalInfo.countryId,
                  appLanguage,
                )
              : {},
          cityId:
            userDetails.personalInfo && userDetails.personalInfo.cityId
              ? await this.utilityService.dataMapperObject(
                  userDetails.personalInfo.cityId,
                  appLanguage,
                )
              : {},
          language: [],
          metaData: {},
        };
        if (userDetails && userDetails.nativeLanguages) {
          const languages = [
            ...userDetails.nativeLanguages.map((lang) => ({
              _id: lang._id,
              name: lang.name?.[appLanguage] || '',
              type: 'native',
            })),
          ];
          userData.language = languages;
        }

        return {
          success: true,
          info: { userProfileData: userData },
          message: this.i18n.t('lang.DATA_FOUND', { lang: appLanguage }),
        };
      } else {
        this.logger.warn(`/user/getUserProfile=====> No record found ! `);
        return {
          success: false,
          info: {},
          message: this.i18n.t('lang.USER_NOT_FOUND', { lang: appLanguage }),
        };
      }
    } catch (error) {
      this.logger.error(
        `/user/getUserProfile/=====> catch S error ===> `,
        error,
      );
      return {
        success: false,
        info: {},
        message: error.message,
      };
    }
  }

  async deleteAccountRequest(language: string, userId: any): Promise<object> {
    try {
      this.logger.log(`user/deleteAccountRequest/=====>`);

      const userinfo = await this.commonService.userDetail({
        _id: userId,
        'status.isActive': true,
      });
      if (!userinfo) {
        this.logger.warn(`/user/deleteAccountRequest/=====> No User Found!`);
        return {
          success: false,
          info: {},
          message: this.i18n.t('lang.USER_NOT_FOUND', { lang: language }),
        };
      }

      await this.userModel.updateMany(
        { favUsers: { $in: [userinfo._id] } },
        { $pull: { favUsers: { $in: [userinfo._id] } } },
      );

      const { token } = userinfo;
      const oldDeviceToken = token.arn;
      const oldVoipToken =
        token.voip == '' || token.voip != undefined ? token.voip : '';

      if (oldDeviceToken) {
        await this.sns.deleteEndpoint(oldDeviceToken);
      }
      if (oldVoipToken) {
        await this.sns.deleteEndpoint(oldVoipToken);
      }

      await this.commonService.updateUserDetails(
        { _id: userinfo._id },
        {
          token: {
            arn: '',
            voip: '',
            login: '',
          },
          'status.isAvailableForCall': false,
          'status.isLogin': false,
          'status.isOnline': false,
          'status.isSelfdelete': true,
          'status.isActive': false,
          'status.isDeleted': false,
          'status.deleteRequestDate': new Date(),
        },
      );
      await this.emailService.sendEmailMailTemplate(
        'app-delete-account-email',
        userinfo,
        userinfo.deviceInfo,
        '',
        language,
      );

      return {
        status: true,
        info: {},
        message: this.i18n.t('lang.ACCOUNT_DELETE_PROCESS', { lang: language }),
      };
    } catch (error) {
      this.logger.error(
        `user/deleteAccountRequest/=====> Catch C Error : `,
        error,
      );
      return {
        status: false,
        info: {},
        message: error.message,
      };
    }
  }
}
