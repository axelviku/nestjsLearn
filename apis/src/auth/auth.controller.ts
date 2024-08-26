import {
  Body,
  Controller,
  Post,
  Get,
  Res,
  Req,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomHeaders } from 'common/decorators/customHeaders.decorator';
import { GlobalI18nValidationPipe } from '../../../common/global-validation.pipe';
import { I18nService } from 'nestjs-i18n';
import { constant } from 'common/constant/constant';
import { AuthGuard } from 'common/guards/auth-guard';

import { AuthService } from './auth.service';
import { AppService } from '../app.service';
import { EmailService } from 'common/email/email.service';
import { ResponseService } from 'common/services/response.service';
import { UtilityService } from 'common/utils/utils.service';
import { CommonService } from '../../../common/utils/common.services';
import { MyLogger } from '../my-logger.service';

import {
  LogInDto,
  RequestOtpSignUp,
  VerifyOtpSignUp,
  SignUpDto,
  SignUpInterpreterDto,
  VerifyReferralCodeDto,
  VerifyEmailDto,
  SocialLoginDataDto,
  DataCollectionsUpdateDto,
  ResetPasswordDto,
} from './auth.dto';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@CustomHeaders()
@UsePipes(GlobalI18nValidationPipe)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly appService: AppService,
    private readonly responseService: ResponseService,
    private readonly emailService: EmailService,
    private readonly utilService: UtilityService,
    private readonly commonService: CommonService,
    private readonly i18n: I18nService,
    private readonly logger: MyLogger,
  ) {}

  @ApiOperation({
    summary: 'Request OTP for email and phone number while sign up.',
  })
  @Post('/requestOtp')
  async RequestOtp(
    @Body() requestOtp: RequestOtpSignUp,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/auth/requestOtp/=====>`);
      this.logger.log(`/auth/requestOtp/=====> Request body : `, requestOtp);

      const language: string = await this.appService.getLanguage(req.headers);
      const deviceInfo: any = req.headers;

      if (requestOtp && requestOtp.type == constant.PHONE) {
        const statusPhoneOtp = await this.authService.requestPhoneOtp(
          requestOtp,
          deviceInfo,
          language,
        );
        this.logger.log(
          `/auth/requestOtp/=====> Response Phone OTP : `,
          statusPhoneOtp,
        );
        if (
          (statusPhoneOtp && statusPhoneOtp.success === true,
          statusPhoneOtp.info)
        ) {
          this.responseService.sendSuccessResponse(
            res,
            statusPhoneOtp.info,
            statusPhoneOtp.message,
          );
        } else {
          this.logger.warn(
            `/auth/requestOtp/=====> Invalid Response `,
            statusPhoneOtp.message,
          );
          this.responseService.sendBadRequest(res, {}, statusPhoneOtp.message);
        }
      } else if (requestOtp && requestOtp.type == constant.EMAIL) {
        const statusEmailOtp = await this.authService.requestEmailOtp(
          requestOtp,
          deviceInfo,
          language,
        );
        this.logger.log(
          `/auth/requestOtp/=====> Response Email OTP : `,
          statusEmailOtp,
        );
        if (
          statusEmailOtp &&
          statusEmailOtp.success === true &&
          statusEmailOtp.info
        ) {
          this.responseService.sendSuccessResponse(
            res,
            statusEmailOtp.info,
            statusEmailOtp.message,
          );
        } else {
          this.logger.warn(
            `/auth/requestOtp/=====> Invalid Response `,
            statusEmailOtp.message,
          );
          this.responseService.sendBadRequest(res, {}, statusEmailOtp.message);
        }
      } else {
        this.logger.warn(`/auth/requestOtp/=====> Invalid request type.`);
        this.responseService.sendBadRequest(
          res,
          {},
          this.i18n.t('lang.INVALID_REQ', { lang: language }),
        );
      }
    } catch (error) {
      this.logger.error(`/auth/requestOtp/=====> Catch Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({
    summary: 'Verify OTP for email and phone number while sign up.',
  })
  @Post('/verifyOtp')
  async VerifyOtp(
    @Body() verifyOtp: VerifyOtpSignUp,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/auth/verifyOtp/=====>`);
      this.logger.log(`/auth/verifyOtp/=====> Request body : `, verifyOtp);
      const language = await this.appService.getLanguage(req.headers);
      if (verifyOtp.type == constant.PHONE) {
        const statusPhoneOtp = await this.authService.verifyOTPPhone(
          verifyOtp,
          language,
        );
        this.logger.log(
          `/auth/verifyOtp/=====> Response Phone OTP : `,
          statusPhoneOtp,
        );
        if (
          statusPhoneOtp &&
          statusPhoneOtp.success === true &&
          statusPhoneOtp.info
        ) {
          this.responseService.sendSuccessResponse(
            res,
            statusPhoneOtp.info,
            statusPhoneOtp.message,
          );
        } else {
          this.logger.warn(
            `/auth/verifyOtp/=====> Invalid Response `,
            statusPhoneOtp.message,
          );
          this.responseService.sendBadRequest(res, {}, statusPhoneOtp.message);
        }
      } else if (verifyOtp.type == constant.EMAIL) {
        const statusEmailOtp = await this.authService.verifyOTPEmail(
          verifyOtp,
          language,
        );
        this.logger.log(
          `/auth/verifyOtp/=====> Response Email OTP : `,
          statusEmailOtp,
        );

        if (
          statusEmailOtp &&
          statusEmailOtp.success === true &&
          statusEmailOtp.info
        ) {
          this.responseService.sendSuccessResponse(
            res,
            statusEmailOtp.info,
            statusEmailOtp.message,
          );
        } else {
          this.logger.warn(
            `/auth/verifyOtp/=====> Invalid Response `,
            statusEmailOtp.message,
          );
          this.responseService.sendBadRequest(res, {}, statusEmailOtp.message);
        }
      } else {
        this.logger.warn(`/auth/verifyOtp/=====> Invalid request type.`);
        this.responseService.sendBadRequest(
          res,
          {},
          this.i18n.t('lang.INVALID_REQ', { lang: language }),
        );
      }
    } catch (error) {
      this.logger.error(`/auth/verifyOtp/=====> Catch Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({
    summary: 'Verify Referral Code in case of Referral Client User sign up.',
  })
  @Post('/verifyReferralCode')
  async verifyReferralCode(
    @Body() VerifyCode: VerifyReferralCodeDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      const language: string = await this.appService.getLanguage(req.headers);
      this.logger.log(`/auth/verifyReferralCode/=====>`);
      const responseData = await this.authService.verifyReferralCode(
        VerifyCode.code,
        language,
      );
      this.logger.log(
        `/auth/verifyReferralCode/=====> Result : `,
        responseData,
      );
      if (responseData && responseData.success === true && responseData.info) {
        this.responseService.sendSuccessResponse(
          res,
          responseData.info,
          responseData.message,
        );
      } else {
        this.logger.warn(
          `/auth/verifyReferralCode/=====> Not a success case : `,
          responseData.message,
        );
        this.responseService.sendBadRequest(res, {}, responseData.message);
      }
    } catch (error) {
      this.logger.error(
        `/auth/verifyReferralCode/=====> Catch Error : `,
        error,
      );
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({ summary: 'Sign up for client and referral client users.' })
  @Post('/signUp')
  async SignUp(
    @Body() SignUpBody: SignUpDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      const language = await this.appService.getLanguage(req.headers);
      this.logger.log(`/auth/signUp/=====>`);
      this.logger.log(`/auth/signUp/=====> Request body : `, SignUpBody);
      const data = await this.authService.signUp(
        language,
        SignUpBody,
        req.headers,
      );

      if (data && data.success === true && data.info) {
        this.responseService.sendSuccessResponse(
          res,
          data.info.user,
          data.info.message,
        );
      } else {
        this.logger.warn(
          `/auth/signUp/=====> No record to Update !! `,
          data.message,
        );
        this.responseService.sendBadRequest(res, {}, data.message);
      }
    } catch (error) {
      this.logger.error(`/auth/signUp/=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({ summary: 'Sign up for interpreter users.' })
  @Post('/signUpInterpreter')
  async SignUpInterpreter(
    @Body() SignUpBody: SignUpInterpreterDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/auth/signUpInterpreter/=====>Api`);
      this.logger.log(
        `/auth/signUpInterpreter/=====> Request body : `,
        SignUpBody,
      );
      const language = await this.appService.getLanguage(req.headers);
      const data = await this.authService.signUpInterpreter(
        language,
        SignUpBody,
        req.headers,
      );

      if (data && data.success === true && data.info) {
        this.responseService.sendSuccessResponse(
          res,
          data.info.user,
          data.info.message,
        );
      } else {
        this.logger.warn(
          `/auth/signUpInterpreter/=====> Invalid Response ! `,
          data.message,
        );
        this.responseService.sendBadRequest(res, {}, data.message);
      }
    } catch (error) {
      this.logger.error(`/auth/signUpInterpreter/=====> Catch Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({ summary: 'Login for all type of users.' })
  @Post('/login')
  async Login(
    @Body() loginBody: LogInDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/auth/login/=====>`);
      this.logger.log(`/auth/login/=====> Request body : `, loginBody);
      const language: string = await this.appService.getLanguage(req.headers);
      const data = await this.authService.loginServices(
        loginBody,
        req.headers,
        language,
      );
      if (data && data.success === true && data.info) {
        this.responseService.sendSuccessResponse(
          res,
          data?.info.user,
          data.message,
        );
      } else {
        this.logger.warn(
          `/auth/login/=====> Invalid response : `,
          data.message,
        );
        this.responseService.sendBadRequest(res, {}, data.message);
      }
    } catch (error) {
      this.logger.error(`/auth/login/=====> Catch Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({ summary: 'Social Login and Social Sign Up.' })
  @Post('/socialLogin')
  async socialLogin(
    @Body() socialLoginData: SocialLoginDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      const lang = await this.appService.getLanguage(req.headers);
      this.logger.log(`/auth/socialLogin/=====>`);
      this.logger.log(
        `/auth/socialLogin/=====> Request body : `,
        socialLoginData,
      );
      const { email, socialType, socialId } = socialLoginData;

      const query: any = {};
      query.$or = [
        { email: email },
        {
          $and: [
            { social: { $elemMatch: { id: socialId } } },
            { social: { $elemMatch: { type: socialType } } },
          ],
        },
      ].filter(Boolean);

      const resultData: any = await this.commonService.userDetail(query);
      if (resultData) {
        if (resultData.status.isSelfdelete) {
          this.responseService.sendBadRequest(
            res,
            {},
            this.i18n.t('lang.ACCOUNT_NOT_ACTIVE_DELETED', { lang: lang }),
          );
        }

        if (!resultData.status.isActive) {
          this.responseService.sendBadRequest(
            res,
            {},
            this.i18n.t('lang.ACCOUNT_NOT_ACTIVE', { lang: lang }),
          );
        }

        const responseData = {
          _id: resultData._id,
          fullName: resultData.fullName,
          email: resultData.email,
          notifications: resultData.userNotifications,
          token: resultData.token,
          isOnline: resultData.status.isOnline,
          profileStatus: resultData.status.profileStatus,
          personalInfo: resultData.personalInfo,
          role: {
            _id: resultData.roleId._id,
            slug: resultData.roleId.slug,
          },
          registrationSteps: resultData.registrationSteps,
          isExist: true,
        };
        this.responseService.sendSuccessResponse(
          res,
          responseData,
          this.i18n.t('lang.SOCIAL_LOGIN_SUCCESSFULLY', { lang: lang }),
        );
      } else {
        this.logger.warn(
          `/auth/socialLogin/=====> Invalid response ! User Already Exists! `,
        );
        this.responseService.sendSuccessResponse(
          res,
          {
            isExist: false,
            email,
          },
          this.i18n.t('lang.NOT_USER_FOUND_FROM_SOCIALID', { lang: lang }),
        );
      }
    } catch (error) {
      this.logger.error(`/auth/socialLogin/=====> Catch Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'Data Collection And Analysis GET Dyanamic data AND UPDATE data while sign up.',
  })
  @Post('/dataCollectionAndAnalysis')
  async dataCollectionAndAnalysisFetchAndUpdate(
    @Body() dataCollections: DataCollectionsUpdateDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      const { _id, roleId, appLanguage } = req['userData'];
      this.logger.log(`/auth/dataCollectionAndAnalysis/=====>`);
      const { dataAnaylysisScreen, tutorialScreen, type } = dataCollections;
      this.logger.log(
        `/auth/dataCollectionAndAnalysis/=====> Request Body : `,
        dataCollections,
      );
      const data: any =
        await this.authService.dataCollectionAndAnalysisFetchAndUpdateRecord(
          _id,
          roleId,
          appLanguage,
          dataAnaylysisScreen,
          tutorialScreen,
          type,
        );
      this.logger.log(
        `/auth/dataCollectionAndAnalysis/=====> Result : `,
        data && data.success,
      );

      if (data && data.success === true && data.info) {
        this.responseService.sendSuccessResponse(res, data.info, data.message);
      } else {
        this.logger.warn(
          `/auth/dataCollectionAndAnalysis/=====> Invalid Request !! `,
          data.message,
        );
        this.responseService.sendBadRequest(res, {}, data.message);
      }
    } catch (error) {
      this.logger.error(
        `/auth/dataCollectionAndAnalysis/=====> Catch C Error : `,
        error,
      );
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({ summary: 'Forget Password with reset email link.' })
  @Post('/forgotPasswordWithResetLink')
  async forgotPasswordWithResetLink(
    @Body() forgetPassword: VerifyEmailDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      const language: string = await this.appService.getLanguage(req.headers);
      this.logger.log(`/auth/forgotPasswordWithResetLink/=====>`);
      const query = { email: forgetPassword.email };
      this.logger.log(
        `/auth/forgotPasswordWithResetLink/=====> Request Body : `,
        forgetPassword,
      );
      const responseData = await this.commonService.userDetail(query);

      if (!responseData) {
        this.responseService.sendBadRequest(
          res,
          {},
          this.i18n.t('lang.NO_RECORD_FOUND', { lang: language }),
        );
        return;
      }

      if (
        responseData &&
        responseData.status &&
        responseData.status.isActive == false
      ) {
        this.responseService.sendBadRequest(
          res,
          {},
          this.i18n.t('lang.RESET_TOKEN_ERROR_INACTIVE_BY_ADMIN', {
            lang: language,
          }),
        );
        return;
      }

      const resetEncryptedToken = await this.utilService.encrypt(
        responseData.fullName + this.utilService.randomString(5),
      );

      const activation_token = await this.utilService.encrypt(
        resetEncryptedToken + '_' + responseData._id.toString(),
      );

      const verification_link =
        process.env.ADMIN_SERVER +
        '/auth/user/mobile-reset-password?token=' +
        activation_token;

      await this.emailService.sendEmail({
        to: forgetPassword.email,
        subject: 'Reset Password',
        template: 'reset-password-link',
        context: { code: verification_link },
      });

      this.commonService.updateUserDetails(
        { _id: responseData._id },
        {
          resetToken: resetEncryptedToken,
          resetPasswordRequestExpiredAt: this.utilService.utcDateTime(
            this.utilService.utcDateTime(),
            constant.RESET_TOKEN_MINUTES,
          ),
        },
      );
      this.responseService.sendSuccessResponse(
        res,
        {},
        this.i18n.t('lang.RESETLINK_SEND_SUCCESS', {
          lang: language,
        }),
      );
      return;
    } catch (error) {
      this.logger.error(`/auth/forgetPassword/=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
      return;
    }
  }

  @ApiOperation({ summary: 'Update password with reset email link.' })
  @Post('/updatePasswordWithResetLink')
  async updatePasswordWithResetLink(
    @Body() ResetPasswordBody: ResetPasswordDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      this.logger.log(`/auth/updatePasswordWithResetLink/=====>`);
      const { password, token } = ResetPasswordBody;
      this.logger.log(
        `/auth/updatePasswordWithResetLink/=====> ResetPasswordBody : `,
        ResetPasswordBody,
      );

      const activation_text = await this.utilService.decrypt(token);
      const reset_token = activation_text.split('_')[0];
      const record_id = activation_text.split('_')[1];

      const userInfo = await this.commonService.userDetail({
        _id: record_id,
        resetToken: reset_token,
      });

      if (!userInfo) {
        this.responseService.sendBadRequest(
          res,
          {},
          this.i18n.t('lang.INVALID_REQ_TOKEN_EXP', { lang: 'en' }),
        );
        return;
      }

      const time1 = this.utilService.utcDateTime().getTime();
      const time2 = new Date(userInfo.resetPasswordRequestExpiredAt).getTime();

      if (time2 < time1) {
        this.responseService.sendBadRequest(
          res,
          {},
          this.i18n.t('lang.INVALID_REQ_LINK_EXP', { lang: 'en' }),
        );
      }
      userInfo.password = password;
      userInfo.resetToken = '';
      await userInfo.save();

      this.responseService.sendSuccessResponse(
        res,
        {},
        this.i18n.t('lang.PASSWORD_CHANGE_SUCCESSFULLY', { lang: 'en' }),
      );
      return;
    } catch (error) {
      this.logger.error(`/auth/resetPassword/=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
      return;
    }
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout from application.' })
  @Post('/logout')
  async logout(@Res() res: Response, @Req() req: Request): Promise<void> {
    try {
      this.logger.log(`/logout/=====>`);
      const language: string = await this.appService.getLanguage(req.headers);
      const userLogout = await this.authService.userLogout(language, req);
      if (!userLogout.success) {
        this.logger.warn(
          `/logout/=====> No Record Found!`,
          'Information not Found',
        );
        this.responseService.sendBadRequest(res, {}, userLogout.message);
        return;
      }
      this.responseService.sendSuccessResponse(res, {}, userLogout.message);
      return;
    } catch (error) {
      this.logger.error(`/logout/=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
      return;
    }
  }

  @ApiOperation({
    summary: 'Get User Profile Detail.',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('/commonDetails')
  async getCommonDetails(
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/auth/commonDetails/=====>`);
    
      const loginUserDetails = req['userData'];
     
     const data = await this.authService.getCommonData(loginUserDetails);
      if (data && data != null) {
        this.responseService.sendSuccessResponse(res, data.info, data.message);
      } else {
        this.logger.warn(`/user/profileDetail=====> No record found ! `);
        this.responseService.sendBadRequest(res, {}, 'No record found');
      }
    } catch (error) {
      this.logger.error(`/user/profileDetail=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }
}
