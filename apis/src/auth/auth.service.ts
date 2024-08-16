import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { User } from 'common/schemas/user.schema';
import { ReferralCode } from 'common/schemas/referralCode.schema';
import { RequestOtp } from 'common/schemas/requestOtp.schema';
import { UtilityService } from 'common/utils/utils.service';
import { TwilioService } from 'common/utils/twilio.service';
import { CommonService } from 'common/utils/common.services';
import { MyLogger } from '../my-logger.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'common/schemas/userRole.schema';
import { SNSService } from 'common/sns';
import { constant, minimumRate } from 'common/constant/constant';
import { Setting } from 'common/schemas/setting.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly sns: SNSService,
    private readonly i18n: I18nService,
    private readonly utilService: UtilityService,
    private readonly commonService: CommonService,
    private readonly smsService: TwilioService,
    private readonly logger: MyLogger,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(RequestOtp.name) private otpModel: Model<RequestOtp>,
    @InjectModel(UserRole.name) private userRoleModel: Model<UserRole>,
    @InjectModel(Setting.name) private SettingModel: Model<Setting>,

    @InjectModel(ReferralCode.name)
    private referralCodeModel: Model<ReferralCode>,
  ) {}

  async requestPhoneOtp(
    requestOtp: { phone: string; countryCode: string; userRole: string },
    deviceInfo: {
      device_name: string;
      device_version: string;
      os: string;
      device_timezone: string;
      app_version: string;
    },
    lang: string,
  ) {
    try {
      this.logger.log(`/auth/requestOtp/=====> requestPhoneOtp S ===> `);
      const isUserPhoneExist = await this.commonService.isPhoneExist(
        requestOtp.phone,
      );
      if (isUserPhoneExist && isUserPhoneExist.status === true) {
        this.logger.warn(
          `/auth/requestOtp/=====> S User phone already Exists !! `,
        );
        return {
          success: false,
          info: {},
          message: this.i18n.t('lang.PHONE_ALREADY_EXISTS', { lang: lang }),
        };
      }

      const findUserPhoneOtp = await this.otpModel.findOne({
        'requestOtpType.phoneNumber': requestOtp.phone,
        otpType: 'SIGNUP',
      });

      if (
        findUserPhoneOtp &&
        findUserPhoneOtp.isVerified &&
        findUserPhoneOtp.isVerified === true
      ) {
        this.logger.log(
          `/auth/requestOtp/=====> requestPhoneOtp ===> S PHONE_ALREADY_VERIFIED `,
        );
        return {
          success: false,
          info: {
            count: 0,
            otpsent: false,
            isVerified: true,
            isUserRegister:
              isUserPhoneExist && isUserPhoneExist.status === true
                ? true
                : false,
          },
          message: this.i18n.t('lang.PHONE_ALREADY_VERIFIED', { lang: lang }),
        };
      }

      const currentTime = new Date();
      const validUntil = await this.utilService.addHoursInCuurentTime(
        constant.REQUEST_OTP_TIME,
      );
      const validUntilDb =
        findUserPhoneOtp && findUserPhoneOtp.otpValidTillDate
          ? new Date(findUserPhoneOtp.otpValidTillDate.getTime())
          : validUntil;

      this.logger.log(
        `/auth/requestOtp/=====> requestPhoneOtp ===> S validUntil :  ${validUntil},  validUntilDb : ${validUntilDb}`,
      );

      if (
        (findUserPhoneOtp && findUserPhoneOtp != null) ||
        findUserPhoneOtp != undefined
      ) {
        if (currentTime >= validUntilDb) {
          this.logger.log(
            `/auth/requestOtp/=====> requestPhoneOtp S ===> Daily Limit Not Reached on Same Day ! `,
          );
          if (findUserPhoneOtp && findUserPhoneOtp.resendOtpCounter == 5) {
            this.logger.log(
              `/auth/requestOtp/=====> requestPhoneOtp S ===> Daily Resend OTP 5 counter Limit Reached and we RESET the count ! `,
            );
            await this.otpModel.findOneAndUpdate(
              {
                'requestOtpType.phoneNumber': requestOtp.phone,
                otpType: 'SIGNUP',
                isVerified: false,
              },
              {
                resendOtpCounter: 1,
                userRole: requestOtp.userRole,
                otpValidTillDate: validUntil,
                deviceInfo: {
                  os: deviceInfo.os,
                  version: deviceInfo.app_version,
                  language: lang,
                  deviceVersion: deviceInfo.device_version,
                  deviceName: deviceInfo.device_name,
                  lastConnectedDate: new Date(),
                  timezone: deviceInfo.device_timezone,
                },
              },
              { new: true },
            );
            return {
              success: true,
              info: {
                otpsent: false,
                count: 1,
                isVerified: false,
                isUserRegister: false,
              },
              message: this.i18n.t('lang.OTP_SENT', { lang: lang }),
            };
          } else {
            this.logger.log(
              `/auth/requestOtp/=====> requestPhoneOtp ===> S Daily Resend OTP Limit Not Reached , New OTP sent ! `,
            );
            const updateSeq = await this.otpModel.findOneAndUpdate(
              {
                'requestOtpType.phoneNumber': requestOtp.phone,
                otpType: 'SIGNUP',
                isVerified: false,
              },
              {
                $inc: { resendOtpCounter: 1 },
                otpValidTillDate: validUntil,
                userRole: requestOtp.userRole,
                deviceInfo: {
                  os: deviceInfo.os,
                  version: deviceInfo.app_version,
                  language: lang,
                  deviceVersion: deviceInfo.device_version,
                  deviceName: deviceInfo.device_name,
                  lastConnectedDate: new Date(),
                  timezone: deviceInfo.device_timezone,
                },
              },
              { new: true },
            );
            return {
              success: true,
              info: {
                otpsent: true,
                count: updateSeq.resendOtpCounter,
                isVerified: false,
                isUserRegister: false,
              },
              message: this.i18n.t('lang.OTP_SENT', { lang: lang }),
            };
          }
        } else {
          this.logger.log(
            `/auth/requestOtp/=====> requestPhoneOtp ===> S Daily Limit Date condition Reached, But available for New Day ! `,
          );
          //const twilioOtp = await this.smsService.twilioRequestPhoneOtp(requestOtp); //TODO SAVE TWILIO OBJ IN REQ AND VERIFY BOTH
          if (findUserPhoneOtp && findUserPhoneOtp.resendOtpCounter == 5) {
            this.logger.warn(
              `/auth/requestOtp/=====> requestPhoneOtp ===> S Daily OTP Limit 5 counter Reached on Same day ! `,
            );
            return {
              success: true,
              info: {
                otpsent: false,
                count: findUserPhoneOtp.resendOtpCounter,
                isVerified: false,
                isUserRegister: false,
              },
              message: this.i18n.t('lang.SMS_LIMIT_REACHED', { lang: lang }),
            };
          } else {
            this.logger.log(
              `/auth/requestOtp/=====> requestPhoneOtp ===> S Existing Entry for a New OTP !! `,
            );
            const updateSeq = await this.otpModel.findOneAndUpdate(
              {
                'requestOtpType.phoneNumber': requestOtp.phone,
                otpType: 'SIGNUP',
                isVerified: false,
              },
              {
                $inc: { resendOtpCounter: 1 },
                otpValidTillDate: validUntil,
                userRole: requestOtp.userRole,
                deviceInfo: {
                  os: deviceInfo.os,
                  version: deviceInfo.app_version,
                  language: lang,
                  deviceVersion: deviceInfo.device_version,
                  deviceName: deviceInfo.device_name,
                  lastConnectedDate: new Date(),
                  timezone: deviceInfo.device_timezone,
                },
              },
              { new: true },
            );
            return {
              success: true,
              info: {
                count: updateSeq.resendOtpCounter,
                otpsent: true,
                isVerified: false,
                isUserRegister: false,
              },
              message: this.i18n.t('lang.OTP_SENT', { lang: lang }),
            };
          }
        }
      } else {
        this.logger.log(
          `/auth/requestOtp/=====> requestPhoneOtp ===> S New First Entry for a OTP !! `,
        );
        // const twilioOtp = await this.smsService.twilioSendPhoneOtp(requestOtp);
        const twilioOtp = { status: 'pending' };
        if (twilioOtp && twilioOtp.status === 'pending') {
          await this.otpModel.create({
            otp: '123456', //twilioOtp.otp
            'requestOtpType.phoneNumber': requestOtp.phone,
            otpType: 'SIGNUP',
            'requestOtpType.countryCode': requestOtp.countryCode,
            otpValidTillDate: validUntil,
            userRole: requestOtp.userRole,
            deviceInfo: {
              os: deviceInfo.os,
              version: deviceInfo.app_version,
              language: lang,
              deviceVersion: deviceInfo.device_version,
              deviceName: deviceInfo.device_name,
              lastConnectedDate: new Date(),
              timezone: deviceInfo.device_timezone,
            },
          });

          return {
            success: true,
            info: {
              count: 1,
              otpsent: true,
              isVerified: false,
              isUserRegister: false,
            },
            message: this.i18n.t('lang.OTP_SENT', { lang: lang }),
          };
        } else {
          this.logger.warn(
            `/auth/requestOtp/=====> requestPhoneOtp ===> S findUserPhoneOtp ===> twilioOtp error : `,
            twilioOtp,
          );
          return {
            success: false,
            info: {
              count: 0,
              otpsent: false,
              isVerified: false,
              isUserRegister: false,
            },
            message: twilioOtp, //TODO UNABLE TO SEND OTP MSG
          };
        }
      }
    } catch (error) {
      this.logger.error(
        `/auth/requestOtp/=====> requestPhoneOtp S ===> error : `,
        error,
      );
      return {
        success: false,
        info: {
          count: 0,
          otpsent: false,
          isVerified: false,
          isUserRegister: false,
        },
        message: error.message,
      };
    }
  }

  async verifyOTPPhone(otp: any, lang: string) {
    try {
      this.logger.log(`/auth/verifyOtp/=====> verifyOTPPhone !!`);
      const otpCheck = await this.otpModel.findOne(
        {
          otp: otp.otp,
          'requestOtpType.phoneNumber': otp.phone,
          otpType: 'SIGNUP',
          'requestOtpType.countryCode': otp.countryCode,
        },
        { isVerified: false },
      );

      if ((!otpCheck && otpCheck == null) || otpCheck == undefined) {
        this.logger.warn(
          `/auth/verifyOtp/=====> verifyOTPPhone ===> OTP_INCORRECT !!`,
        );
        return {
          success: false,
          info: { status: 'incorrect' },
          message: this.i18n.t('lang.OTP_INCORRECT', { lang: lang }),
        };
      }
      // const verificationCheck = await this.smsService.phoneOtpVerify(otp); //TODO
      // this.logger.log(`/auth/verifyOtp/=====> verifyOTPPhone ===> verificationCheck ====>  : `, verificationCheck);
      const verificationCheck = {
        status: 'approved',
      };
      if (verificationCheck.status === 'approved') {
        this.logger.log(
          `/auth/verifyOtp/=====> verifyOTPPhone ===> verificationCheckStatus : `,
          verificationCheck.status,
        );

        await this.otpModel.updateOne(
          { 'requestOtpType.phoneNumber': otp.phone, otpType: 'SIGNUP' },
          { isVerified: true },
        );
        return {
          success: true,
          info: { status: verificationCheck.status },
          message: this.i18n.t('lang.OTP_VERIFIED', { lang: lang }),
        };
      } else {
        this.logger.warn(
          `/auth/verifyOtp/=====> verifyOTPPhone ===> OTP_INCORRECT !!`,
        );
        return {
          success: false,
          info: { status: verificationCheck.status },
          message: this.i18n.t('lang.OTP_INCORRECT', { lang: lang }),
        };
      }
    } catch (error) {
      this.logger.error(
        `/auth/verifyOtp/=====> verifyOTPPhone ===>  error : `,
        error,
      );
      return {
        success: false,
        info: {
          status: '',
        },
        message: error.message,
      };
    }
  }

  async requestEmailOtp(
    requestOtp: { email: string; userRole: string },
    deviceInfo: {
      device_name: string;
      device_version: string;
      os: string;
      device_timezone: string;
      app_version: string;
    },
    lang: string,
  ) {
    try {
      this.logger.log(`/auth/requestOtp/=====> requestEmailOtp ===> `);
      const findUserEmailOtp = await this.otpModel.findOne({
        'requestOtpType.emailAddress': requestOtp.email,
        otpType: 'SIGNUP',
      });

      if (
        findUserEmailOtp &&
        findUserEmailOtp.isVerified &&
        findUserEmailOtp.isVerified === true
      ) {
        const isUserEmailAlreadyExist = await this.commonService.isEmailExist(
          requestOtp.email,
        );
        const isUserRegister =
          isUserEmailAlreadyExist &&
          isUserEmailAlreadyExist.status &&
          isUserEmailAlreadyExist.status === true
            ? true
            : false;
        this.logger.log(
          `/auth/requestOtp/=====> isUserRegister ===>  ${isUserRegister}`,
        );
        return {
          success: true,
          info: {
            count: 0,
            otpsent: false,
            isVerified: true,
            isUserRegister: isUserRegister,
          },
          message: isUserRegister
            ? this.i18n.t('lang.EMAIL_ALREADY_VERIFIED_LOGIN', { lang: lang })
            : this.i18n.t('lang.EMAIL_ALREADY_VERIFIED', { lang: lang }),
        };
      }

      const currentTime = new Date();
      const validUntil = await this.utilService.addHoursInCuurentTime(
        constant.REQUEST_OTP_TIME,
      );

      const validUntilDb =
        findUserEmailOtp && findUserEmailOtp.otpValidTillDate
          ? new Date(findUserEmailOtp.otpValidTillDate.getTime())
          : new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);

      this.logger.log(
        `/auth/requestOtp/=====> requestEmailOtp ===> findUserEmailOtp : `,
        findUserEmailOtp,
      );
      if (findUserEmailOtp != null || findUserEmailOtp != undefined) {
        if (currentTime >= validUntilDb) {
          this.logger.log(
            `/auth/requestOtp/=====> requestEmailOtp ===> Daily Limit Not Reached ! `,
          );
          if (findUserEmailOtp && findUserEmailOtp.resendOtpCounter == 5) {
            this.logger.log(
              `/auth/requestOtp/=====> requestEmailOtp ===> Daily Resend OTP Limit Reached on Same day ! `,
            );
            await this.otpModel.findOneAndUpdate(
              {
                'requestOtpType.emailAddress': requestOtp.email,
                otpType: 'SIGNUP',
                isVerified: false,
              },
              {
                resendOtpCounter: 1,
                otpValidTillDate: validUntil,
                userRole: requestOtp.userRole,
                deviceInfo: {
                  os: deviceInfo.os,
                  version: deviceInfo.app_version,
                  language: lang,
                  deviceVersion: deviceInfo.device_version,
                  deviceName: deviceInfo.device_name,
                  lastConnectedDate: new Date(),
                  timezone: deviceInfo.device_timezone,
                },
              },
              { new: true },
            );
            return {
              success: true,
              info: {
                otpsent: false,
                count: 1,
                isVerified: false,
                isUserRegister: false,
              },
              message: this.i18n.t('lang.OTP_SENT', { lang: lang }),
            };
          } else {
            this.logger.log(
              `/auth/requestOtp/=====> requestEmailOtp ===> Daily Resend OTP Limit Not Reached ! `,
            );
            // const twilioOtp = await this.smsService.sendEmail(requestOtp.email);
            const updateSeq = await this.otpModel.findOneAndUpdate(
              {
                'requestOtpType.emailAddress': requestOtp.email,
                otpType: 'SIGNUP',
                isVerified: false,
              },
              {
                $inc: { resendOtpCounter: 1 },
                otpValidTillDate: validUntil,
                userRole: requestOtp.userRole,
                deviceInfo: {
                  os: deviceInfo.os,
                  version: deviceInfo.app_version,
                  language: lang,
                  deviceVersion: deviceInfo.device_version,
                  deviceName: deviceInfo.device_name,
                  lastConnectedDate: new Date(),
                  timezone: deviceInfo.device_timezone,
                },
              },
              { new: true },
            );
            return {
              success: true,
              info: {
                otpsent: true,
                count: updateSeq.resendOtpCounter,
                isVerified: false,
                isUserRegister: false,
              },
              message: this.i18n.t('lang.OTP_SENT', { lang: lang }),
            };
          }
        } else {
          this.logger.log(
            `/auth/requestOtp/=====> requestEmailOtp ===> Daily Limit Reached, But available for New Day ! `,
          );
          // const twilioOtp = await this.smsService.sendEmail(requestOtp.email); //TODO SAVE TWILIO OBJ IN REQ AND VERIFY BOTH
          if (findUserEmailOtp && findUserEmailOtp.resendOtpCounter == 5) {
            this.logger.warn(
              `/auth/requestOtp/=====> requestEmailOtp ===> Daily Resend OTP Limit Reached on Same day ! `,
            );
            return {
              success: true,
              info: {
                otpsent: false,
                count: findUserEmailOtp.resendOtpCounter,
                isVerified: false,
                isUserRegister: false,
              },
              message: this.i18n.t('lang.SMS_LIMIT_REACHED', { lang: lang }),
            };
          } else {
            // const twilioOtp = await this.smsService.sendEmail(requestOtp.email);
            const updateSeq = await this.otpModel.findOneAndUpdate(
              {
                'requestOtpType.emailAddress': requestOtp.email,
                otpType: 'SIGNUP',
                isVerified: false,
              },
              {
                $inc: { resendOtpCounter: 1 },
                otpValidTillDate: validUntil,
                userRole: requestOtp.userRole,
                deviceInfo: {
                  os: deviceInfo.os,
                  version: deviceInfo.app_version,
                  language: lang,
                  deviceVersion: deviceInfo.device_version,
                  deviceName: deviceInfo.device_name,
                  lastConnectedDate: new Date(),
                  timezone: deviceInfo.device_timezone,
                },
              },
              { new: true },
            );
            return {
              success: true,
              info: {
                count: updateSeq.resendOtpCounter,
                otpsent: true,
                isVerified: false,
                isUserRegister: false,
              },
              message: this.i18n.t('lang.OTP_SENT', { lang: lang }),
            };
          }
        }
      } else {
        this.logger.log(
          `/auth/requestOtp/=====> requestEmailOtp ===> New First Entry !! `,
        );
        // const twilioOtp = await this.smsService.sendEmail(requestOtp.email);
        const twilioOtp = { status: 'pending' };
        if (twilioOtp && twilioOtp.status === 'pending') {
          await this.otpModel.create({
            otp: '123456', //twilioOtp.otp
            'requestOtpType.emailAddress': requestOtp.email,
            otpType: 'SIGNUP',
            otpValidTillDate: validUntil,
            userRole: requestOtp.userRole,
            deviceInfo: {
              os: deviceInfo.os,
              version: deviceInfo.app_version,
              language: lang,
              deviceVersion: deviceInfo.device_version,
              deviceName: deviceInfo.device_name,
              lastConnectedDate: new Date(),
              timezone: deviceInfo.device_timezone,
            },
          });

          return {
            success: true,
            info: {
              count: 1,
              otpsent: true,
              isVerified: false,
              isUserRegister: false,
            },
            message: this.i18n.t('lang.OTP_SENT', { lang: lang }),
          };
        } else {
          this.logger.warn(
            `/auth/requestOtp/=====> requestEmailOtp ===> findUserEmailOtp ===> twilioOtp error : `,
            twilioOtp,
          );
          return {
            success: false,
            info: {
              count: 0,
              otpsent: false,
              isVerified: false,
              isUserRegister: false,
            },
            message: twilioOtp, //TODO UNABLE TO SEND OTP MSG
          };
        }
      }
    } catch (error) {
      this.logger.error(
        `/auth/requestOtp/=====> requestEmailOtp ===> findUserEmailOtp ===> error : `,
        error,
      );
      return {
        success: false,
        info: {
          count: 0,
          otpsent: false,
          isVerified: false,
          isUserRegister: false,
        },
        message: error.message,
      };
    }
  }

  async verifyOTPEmail(otp: any, lang: string) {
    try {
      const otpCheck = await this.otpModel.findOne(
        {
          otp: otp.otp,
          'requestOtpType.emailAddress': otp.email,
          otpType: 'SIGNUP',
        },
        { isVerified: false },
      );

      if ((!otpCheck && otpCheck == null) || otpCheck == undefined) {
        this.logger.warn(
          `/auth/verifyOtp/=====> verifyOTPEmail ===> OTP_INCORRECT !`,
        );
        return {
          success: false,
          info: { status: 'incorrect' },
          message: this.i18n.t('lang.OTP_INCORRECT', { lang: lang }),
        };
      }
      // const verificationCheck = await this.smsService.otpVerifyEmail(otp);
      //  this.logger.log(`/auth/verifyOtp/=====> verifyOTPEmail ===> verificationCheck ====>  : `, verificationCheck);
      const verificationCheck = {
        status: 'approved',
      };
      if (verificationCheck.status === 'approved') {
        this.logger.log(
          `/auth/verifyOtp/=====> verifyOTPEmail ===> verificationCheckStatus  : `,
          verificationCheck.status,
        );
        await this.otpModel.updateOne(
          { 'requestOtpType.emailAddress': otp.email, otpType: 'SIGNUP' },
          { isVerified: true },
        );
        return {
          success: true,
          info: { status: verificationCheck.status },
          message: this.i18n.t('lang.OTP_VERIFIED', { lang: lang }),
        };
      } else {
        this.logger.warn(
          `/auth/verifyOtp/=====> verifyOTPEmail ===> OTP_INCORRECT ! `,
        );
        return {
          success: false,
          info: { status: verificationCheck.status },
          message: this.i18n.t('lang.OTP_INCORRECT', { lang: lang }),
        };
      }
    } catch (error) {
      this.logger.error(
        `/auth/verifyOtp/=====> verifyOTPEmail ===>  error : `,
        error,
      );
      return {
        success: false,
        info: {
          status: ' ',
        },
        message: error.message,
      };
    }
  }

  async verifyReferralCode(code: string, lang: string) {
    try {
      const refCodeResult = await this.referralCodeModel.findOne({
        referralCode: code,
        isActive: true,
      });
      this.logger.log(
        `/auth/verifyReferralCode/=====> refCodeResult : `,
        refCodeResult,
      );
      if (!refCodeResult) {
        this.logger.warn(
          `/auth/verifyReferralCode/=====> Invalid Referral Code!  `,
        );
        return {
          success: false,
          info: {},
          message: this.i18n.t('lang.REFERAL_CODE_INVALID', { lang: lang }),
        };
      }

      return {
        success: true,
        info: { referralCodeId: refCodeResult && refCodeResult._id },
        message: this.i18n.t('lang.referral_code_verify', { lang: lang }),
      };
    } catch (error) {
      this.logger.error(
        `/auth/verifyReferralCode/=====> Catch S error : `,
        error,
      );

      return {
        success: false,
        info: {},
        message: this.i18n.t('lang.ERROR_IN_REG', { lang: lang }),
      };
    }
  }

  async dataCollectionAndAnalysisFetchAndUpdateRecord(
    userId: string,
    roleId: any,
    lang: string,
    dataAnaylysisScreen: boolean,
    tutorialScreen: boolean,
    type: string,
  ): Promise<object> {
    try {
      if (type && type === constant.FETCH_DAC_DATA) {
        this.logger.log(
          `/auth/dataCollectionAndAnalysis/=====> FETCH_DAC_DATA`,
        );
        const userRoleName =
          roleId.slug == 'interpreter' ? roleId.slug : 'client';
        const dataCollection = await this.SettingModel.findOne({
          'dataCollectionAndAnalysis.userRoleName': userRoleName,
        })
          .lean()
          .exec();

        if (
          dataCollection &&
          Array.isArray(dataCollection.dataCollectionAndAnalysis)
        ) {
          let userRoleData = null;
          for (const item of dataCollection.dataCollectionAndAnalysis) {
            if (item.userRoleName === userRoleName) {
              userRoleData = item;
              break;
            }
          }
          if (userRoleData) {
            const title = userRoleData.title[lang];
            const description = userRoleData.description[lang];
            const longDescription = userRoleData.longDescription[lang];
            return {
              success: true,
              info: {
                dataCollectionAndAnalysis: {
                  title,
                  description,
                  longDescription,
                },
              },
              message: this.i18n.t('lang.data_collection_and_analysis', {
                lang: lang,
              }),
            };
          } else {
            return {
              success: false,
              info: {
                dataCollectionAndAnalysis: {},
              },
              message: this.i18n.t('lang.NO_RECORD_FOUND', {
                lang: lang,
              }),
            };
          }
        } else {
          this.logger.log(
            `/auth/requestOtp/=====> dataCollection ===> : `,
            dataCollection,
          );
          return {
            success: true,
            info: {
              dataCollectionAndAnalysis: {},
            },
            message: this.i18n.t('lang.data_collection_and_analysis', {
              lang: lang,
            }),
          };
        }
      } else if (type && type === constant.POST_DCA_DATA) {
        this.logger.log(`/auth/dataCollectionAndAnalysis/=====> POST_DCA_DATA`);
        const user = new mongoose.Types.ObjectId(userId);

        let updateQuery = {};
        if (dataAnaylysisScreen == true) {
          updateQuery = { 'registrationSteps.dataAnalysisScreen': true };
        }
        if (tutorialScreen == true) {
          updateQuery = {
            'registrationSteps.tutorialScreen': true,
            'status.profileStatus': 'Complete',
          };
        }
        return this.userModel
          .findOneAndUpdate({ _id: user }, { $set: updateQuery }, { new: true })
          .then((result) => {
            if (result) {
              return {
                success: true,
                info: {
                  registrationSteps: result.registrationSteps,
                },
                message: this.i18n.t('lang.data_collection', { lang: lang }),
              };
            } else {
              return {
                success: false,
                info: {
                  dataCollectionAndAnalysis: {},
                },
                message: this.i18n.t('lang.data_collection_not_update', {
                  lang: lang,
                }),
              };
            }
          })
          .catch((error) => {
            this.logger.error(
              `/auth/dataCollectionAndAnalysis/=====> Catch S Error: `,
              error,
            );
            return {
              success: false,
              info: {
                dataCollectionAndAnalysis: {},
              },
              message: error.message,
            };
          });
      } else {
        this.logger.warn(`/auth/dataCollectionAndAnalysis/=====> INVALID TYPE`);
        return {
          success: false,
          info: {
            dataCollectionAndAnalysis: {},
          },
          message: this.i18n.t('lang.data_collection_not_update', {
            lang: lang,
          }),
        };
      }
    } catch (error) {
      this.logger.error(
        `/auth/dataCollectionAndAnalysis/=====> Catch S Error : `,
        error,
      );
      return {
        success: false,
        info: {
          dataCollectionAndAnalysis: {},
        },
        message: error.message,
      };
    }
  }

  async signUp(lang: string, SignUpBody: any, headers: any) {
    try {
      const {
        email,
        gender,
        isPTFlag,
        fullName,
        source,
        password,
        gdprAccepted,
        countryId,
        phone,
        countryCode,
        formattedMobile,
        timezone,
        preferredCurrency,
        referralCode,
        nativeLanguages,
        socialId,
        socialType,
        prefectureId,
        photo,
        cityId,
        voipToken,
        deviceToken,
      } = SignUpBody;

      let refCode: string = referralCode;

      if (source == 'email') {
        const isUserEmailVerified = await this.commonService.isEmailVerified(
          email,
        );
        if (isUserEmailVerified && isUserEmailVerified.status === false) {
          this.logger.warn(
            `/auth/signUp/=====> User Email is not verified !! `,
          );
          return {
            success: false,
            info: {},
            message: this.i18n.t('lang.EMAIL_NOT_VERIFIED', { lang: lang }),
          };
        }
      }

      if (phone && phone != undefined) {
        const isUserPhonelVerified = await this.commonService.isPhoneVerified(
          phone,
        );
        if (isUserPhonelVerified && isUserPhonelVerified.status === false) {
          this.logger.warn(
            `/auth/signUp/=====> User Phone is not verified !! `,
          );
          return {
            success: false,
            info: {},
            message: this.i18n.t('lang.PHONE_NOT_VERIFIED', { lang: lang }),
          };
        }
      }

      const isUserEmailExist = await this.commonService.isEmailExist(email);
      if (isUserEmailExist && isUserEmailExist.status === true) {
        this.logger.warn(`/auth/signUp/=====> User Email already Exists !! `);
        return {
          success: false,
          info: {},
          message: this.i18n.t('lang.EMAIL_ALREADY_VERIFIED_LOGIN', {
            lang: lang,
          }),
        };
      }
      const userRoleName =
        referralCode != null && referralCode != undefined && referralCode != ''
          ? 'referral_user'
          : 'client';
      let roleDetails = await this.commonService.roleData(userRoleName);

      if (!roleDetails) {
        this.logger.warn(`/auth/signUp/=====> User Role is Undefined !! `);
        return {
          success: false,
          info: {},
          message: this.i18n.t('lang.USER_ROLE_UNDEFINED', { lang: lang }),
        };
      }

      const data = {
        fullName,
        source,
        roleId: roleDetails._id,
        userReferralCode: new mongoose.Types.ObjectId(refCode),
        email,
        password,
        social: source == 'social' ? [{ type: socialType, id: socialId }] : [],
        mobile: phone,
        countryCode: countryCode,
        formattedMobile: formattedMobile,
        personalInfo: {
          userNo: '1',
          gender,
          photo,
          countryId,
          cityId,
          preferredCurrency,
        },
        status: {
          isPTFlag,
          gdprAccepted,
          profileStatus: 'Registered',
        },
        deviceInfo: {
          os: headers.os,
          version: headers.version,
          language: headers.language,
          deviceVersion: headers.device_version,
          deviceName: headers.device_name,
          timezone,
          lastConnectedDate: new Date(),
        },
        verification: {
          email: true,
          phone: true,
        },
        registrationSteps: {
          emailVerify: true,
          registerScreen: true,
        },
        nativeLanguages: nativeLanguages.map(
          (id: string) => new mongoose.Types.ObjectId(id),
        ),
        prefectureId,
      };

      const createdUser = new this.userModel(data);
      const savedUser = await createdUser.save();

      if (savedUser) {
        const token: string = await this.utilService.generateLoginToken(
          savedUser._id.toString(),
        );
        const newTokens: any = await this.sns.createEndpointWithDelete(
          { voip: voipToken, token: deviceToken },
          {},
          headers.os,
        );

        const savedData = await this.userModel.findOneAndUpdate(
          { _id: savedUser._id },
          {
            token: {
              arn: newTokens.arn.EndpointArn,
              voip: newTokens.voip.EndpointArn,
              login: token,
            },
          },
          { new: true },
        );

        const responseData = {
          _id: savedData._id,
          fullName: savedData.fullName,
          email: savedData.email,
          notifications: savedData.userNotifications,
          token: savedData.token,
          isOnline: savedData.status.isOnline,
          profileStatus: savedData.status.profileStatus,
          personalInfo: savedData.personalInfo,
          role: {
            _id: roleDetails._id,
            slug: roleDetails.slug,
          },
          registrationSteps: savedData.registrationSteps,
        };
        this.logger.log(
          `/auth/signUp/=====> Sign Up Response : `,
          responseData,
        );
        return {
          success: true,
          info: {
            user: responseData,
            message: this.i18n.t('lang.SUCCESSFUL_REGISTER_MSG', {
              lang: lang,
            }),
          },
        };
      } else {
        this.logger.warn(
          `/auth/signUp/=====> Unable to save user on sign up !! `,
        );
        return {
          success: false,
          info: {},
          message: this.i18n.t('lang.ERROR_IN_REG', { lang: lang }),
        };
      }
    } catch (error) {
      this.logger.error(`/auth/signUp/=====> catch S error ===> `, error);
      return {
        success: false,
        info: {},
        message: error.message,
      };
    }
  }

  async signUpInterpreter(
    lang: string,
    SignUpInterpreterBody: any,
    headers: any,
  ) {
    try {
      const {
        email,
        gender,
        isPTFlag,
        fullName,
        source,
        password,
        gdprAccepted,
        countryId,
        phone,
        countryCode,
        formattedMobile,
        timezone,
        preferredCurrency,
        referralCode,
        nativeLanguages,
        socialId,
        socialType,
        prefectureId,
        photo,
        cityId,
        profileDetails,
        expertiseList,
        associations,
        qualification,
        academicBackground,
        professionalDocs,
        interpretationLanguages,
        voipToken,
        deviceToken,
      } = SignUpInterpreterBody;

      if (source == 'email') {
        const isUserEmailVerified = await this.commonService.isEmailVerified(
          email,
        );
        if (isUserEmailVerified && isUserEmailVerified.status === false) {
          this.logger.warn(
            `/auth/signUpInterpreter/=====> User Email is not verified !! `,
          );
          return {
            success: false,
            info: {},
            message: this.i18n.t('lang.EMAIL_NOT_VERIFIED', { lang: lang }),
          };
        }
      }

      if (phone && phone != undefined) {
        const isUserPhonelVerified = await this.commonService.isPhoneVerified(
          phone,
        );
        if (isUserPhonelVerified && isUserPhonelVerified.status === false) {
          this.logger.warn(
            `/auth/signUpInterpreter/=====> User Phone is not verified !! `,
          );
          return {
            success: false,
            info: {},
            message: this.i18n.t('lang.PHONE_NOT_VERIFIED', { lang: lang }),
          };
        }
      }

      const isUserEmailExist = await this.commonService.isEmailExist(email);
      if (isUserEmailExist && isUserEmailExist.status === true) {
        this.logger.warn(`/auth/signUp/=====> User Email already Exists !! `);
        return {
          success: false,
          info: {},
          message: this.i18n.t('lang.EMAIL_ALREADY_VERIFIED_LOGIN', {
            lang: lang,
          }),
        };
      }

      const roleDetails: any = await this.commonService.roleData('interpreter');

      const all_language = await nativeLanguages.concat(
        interpretationLanguages.filter((item) => {
          return nativeLanguages.indexOf(item) === -1;
        }),
      );

      const rates = [];
      for (let i = 0; i < all_language.length; i++) {
        for (let j = i + 1; j < all_language.length; j++) {
          rates.push({
            languages: [all_language[i], all_language[j]],
            fee: minimumRate[preferredCurrency],
            usd_fee: minimumRate['USD'],
            currency: preferredCurrency,
          });
        }
      }

      const data = {
        fullName,
        source,
        roleId: roleDetails._id,
        userReferralCode: referralCode,
        email,
        password,
        social: source == 'social' ? [{ type: socialType, id: socialId }] : [],
        mobile: phone,
        countryCode: countryCode,
        formattedMobile: formattedMobile,
        personalInfo: {
          userNo: '1',
          gender,
          photo,
          countryId,
          cityId,
          preferredCurrency,
        },
        status: {
          isLogin: true,
          isPTFlag,
          gdprAccepted,
          profileStatus: 'Registered',
        },
        token: {
          arn: 'arn',
          voip: 'voip',
          login: 'login',
        },
        deviceInfo: {
          os: headers.os,
          version: headers.version,
          language: headers.language,
          deviceVersion: headers.device_version,
          deviceName: headers.device_name,
          timezone,
          lastConnectedDate: new Date(),
        },
        verification: {
          email: true,
        },
        registrationSteps: {
          emailVerify: true,
          registerScreen: true,
        },
        nativeLanguages,
        prefectureId,
        interpreterInfo: {
          profileDetails,
          interpretationLanguages,
          expertiseList,
          associations,
          qualification,
          academicBackground,
          professional: {
            docs: professionalDocs,
          },
          interpreterRates: rates,
        },
      };
      const createdUser = new this.userModel(data);

      const savedUser = await createdUser.save();
      if (savedUser) {
        const token: string = await this.utilService.generateLoginToken(
          savedUser._id.toString(),
        );
        const newTokens: any = await this.sns.createEndpointWithDelete(
          { voip: voipToken, token: deviceToken },
          {},
          headers.os,
        );
        const savedData: any = await this.userModel
          .findOneAndUpdate(
            { _id: savedUser._id },
            {
              token: {
                arn: newTokens.arn.EndpointArn,
                voip: newTokens.voip.EndpointArn,
                login: token,
              },
            },
            { new: true },
          )
          .populate('interpreterInfo.interpreterRates.languages', '_id name');

        const newates = [];
        const savedRate = savedData?.interpreterInfo?.interpreterRates;

        for (let i = 0; i < savedRate.length; i++) {
          const languageRate = await this.utilService.dataMapperArray(
            savedRate[i].languages,
            lang,
          );
          newates.push({
            fee: savedData.interpreterInfo.interpreterRates[i].fee,
            currency: savedData.interpreterInfo.interpreterRates[i].currency,
            language: languageRate[0],
          });
        }

        const responseData = {
          _id: savedData._id,
          fullName: savedData.fullName,
          email: savedData.email,
          notifications: savedData.userNotifications,
          token: savedData.token,
          isOnline: savedData.status.isOnline,
          profileStatus: savedData.status.profileStatus,
          personalInfo: savedData.personalInfo,
          role: {
            _id: roleDetails._id,
            slug: roleDetails.slug,
          },
          rates: newates,
          registrationSteps: savedData.registrationSteps,
        };

        return {
          success: true,
          info: {
            user: responseData,
            message: this.i18n.t('lang.SUCCESSFUL_REGISTER_MSG', {
              lang: lang,
            }),
          },
        };
      } else {
        this.logger.warn(
          `/auth/signUpInterpreter/=====> Unable to save interpreter on sign up !! `,
        );
        return {
          success: false,
          info: {},
          message: this.i18n.t('lang.ERROR_IN_REG', { lang: lang }),
        };
      }
    } catch (error) {
      this.logger.error(
        `/auth/signUpInterpreter/=====> catch S error ===> `,
        error,
      );
      return {
        success: false,
        info: {},
        message: error.message,
      };
    }
  }

  async loginServices(loginData: any, headers: any, lang: string) {
    try {
      const { email, password, voipToken, deviceToken, timezone } = loginData;
      const user: any = await this.userModel
        .findOne({
          email,
        })
        .select(
          '_id password interpreterInfo status email source userReferralCode personalInfo deviceInfo roleId',
        )
        .populate({
          path: 'roleId',
          select: '_id name slug',
        });

      if (!user) {
        this.logger.log(
          `/auth/login/=====> INVALID_CREDENTIALS - USER NOT FOUND ! `,
        );
        return {
          success: false,
          info: {},
          message: this.i18n.t('lang.USER_NOT_FOUND', { lang: lang }),
        };
      }

      if (user.status.isSelfdelete) {
        return {
          success: false,
          info: {},
          message: this.i18n.t('lang.ACCOUNT_NOT_ACTIVE_DELETED', {
            lang: lang,
          }),
        };
      }

      if (!user.status.isActive) {
        return {
          success: false,
          info: {},
          message: this.i18n.t('lang.ACCOUNT_NOT_ACTIVE', { lang: lang }),
        };
      }

      const isPasswordMatching = await bcrypt.compare(password, user.password);
      if (!isPasswordMatching) {
        this.logger.log(
          `/auth/login/=====> INVALID_CREDENTIALS - INCORRECT PASSWORD ! `,
        );
        return {
          success: false,
          info: {},
          message: this.i18n.t('lang.INVALID_CREDENTIALS', { lang: lang }),
        };
      }

      const token = await this.utilService.generateLoginToken(user._id);

      const newTokens: any = await this.sns.createEndpointWithDelete(
        { voip: voipToken, token: deviceToken },
        { token: user?.token?.arn, voip: user?.token?.voip },
        headers.os,
      );
      this.logger.log(
        `/auth/login/=====> createEndpointWithDelete :  `,
        newTokens,
      );

      const userData = await this.userModel.findOneAndUpdate(
        { _id: user._id },
        {
          $set: {
            deviceInfo: {
              os: headers.os,
              version: headers.version,
              language: headers.language,
              deviceVersion: headers.device_version,
              deviceName: headers.device_name,
              timezone: timezone,
              lastConnectedDate: new Date(),
            },
            token: {
              arn: newTokens?.arn?.EndpointArn,
              voip: newTokens?.voip?.EndpointArn,
              login: token,
            },
            'status.isLogin': true,
            'status.isOnline': true,
          },
        },
        { new: true },
      );

      if (userData) {
        const responseData = {
          _id: userData._id,
          fullName: userData.fullName,
          email: userData.email,
          notifications: userData.userNotifications,
          token: userData.token,
          isOnline: userData.status.isOnline,
          profileStatus: userData.status.profileStatus,
          personalInfo: userData.personalInfo,
          role: {
            _id: user.roleId._id,
            slug: user.roleId.slug,
          },
          registrationSteps: userData.registrationSteps,
        };

        this.logger.log(`/auth/login/=====> responseData :  `, responseData);

        return {
          success: true,
          info: {
            user: responseData,
          },
          message: this.i18n.t('lang.LOGIN_SUCCESSFULLY', { lang: lang }),
        };
      } else {
        this.logger.log(
          `/auth/login/=====> INVALID_CREDENTIALS - userData `,
          userData,
        );
        return {
          success: false,
          info: {
            user: {},
          },
          message: this.i18n.t('lang.NO_RECORD_FOUND', { lang: lang }),
        };
      }
    } catch (error) {
      this.logger.error(`/auth/login/=====> catch S error ===> `, error);
      return {
        success: false,
        info: {
          user: {},
        },
        message: this.i18n.t('lang.LOGIN_FAILED', { lang: lang }),
      };
    }
  }

  async userLogout(lang: string, req: any): Promise<any> {
    try {
      const { userData } = req;
      this.logger.log(`/auth/userLogout/=====>`);
      if (!userData) {
        this.logger.warn(`/auth/userLogout/=====> No User Found!`);
        return {
          success: false,
          info: {},
          message: this.i18n.t('lang.USER_NOT_FOUND', { lang: lang }),
        };
      }
      const userinfo = await this.commonService.userDetail({
        _id: userData._id,
        'status.isActive': true,
      });
      if (!userinfo) {
        this.logger.warn(`/auth/userLogout/=====> No User Found!`);
        return {
          success: false,
          info: {},
          message: this.i18n.t('lang.USER_NOT_FOUND', { lang: lang }),
        };
      }
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
        },
      );

      return {
        success: true,
        info: {},
        message: this.i18n.t('lang.LOGOUT_SUCCESSFULLY', { lang: lang }),
      };
    } catch (error) {
      this.logger.error(`/auth/userLogout/=====> Catch C Error : `, error);
      return {
        success: false,
        info: {},
        message: error.message,
      };
    }
  }
}
