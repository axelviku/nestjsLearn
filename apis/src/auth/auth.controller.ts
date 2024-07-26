import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  Req,
  UsePipes,
  Next,
  UseGuards,
  Param,
  All,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import {
  CustomHeaders,
  Public,
} from 'common/decorators/customHeaders.decorator';
import { GlobalI18nValidationPipe } from '../../../common/global-validation.pipe';
import { AuthGuard } from 'common/guards/auth-guard';

import { AuthService } from './auth.service';
import { AppService } from '../app.service';
import { ResponseService } from 'common/services/response.service';
import { UtilityService } from 'common/utils/utils.service';
import { I18nService, I18nLang } from 'nestjs-i18n';
import {
  LogInDto,
  RequestOtpSignUp,
  VerifyOtpSignUp,
  SignUpDto,
  SignUpInterpreterDto,
  verifyReferralCodeDto,
  verifyEmailDto,
  changePasswordDto,
  socialSignupDto,
  dataCollectionsUpdateDto,
  dataCollectionsAndAnalysisDto,
  dataCollectionsAndAnalysisPostDto,
} from './auth.dto';
import { CommonService } from '../../../common/utils/common.services';
import { constant } from 'common/constant/constant';
import { MyLogger } from '../my-logger.service';
import {
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@CustomHeaders()
@UsePipes(GlobalI18nValidationPipe)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly appService: AppService,
    private readonly responseService: ResponseService,
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
        if (statusPhoneOtp && statusPhoneOtp.success) {
          this.responseService.sendSuccessResponse(
            res,
            statusPhoneOtp.info,
            statusPhoneOtp.message,
          );
        } else {
          this.responseService.sendForbidden(res, statusPhoneOtp.message);
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
        if (statusEmailOtp && statusEmailOtp.success && statusEmailOtp.info) {
          this.responseService.sendSuccessResponse(
            res,
            statusEmailOtp.info,
            statusEmailOtp.message,
          );
        } else {
          this.responseService.sendForbidden(res, statusEmailOtp.message);
        }
      } else {
        this.logger.warn(`/auth/requestOtp/=====> Invalid request type.`);
        this.responseService.sendBadRequest(res);
      }
    } catch (error) {
      this.logger.error(`/auth/requestOtp/=====> Catch Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({ summary: 'Verify OTP for email and phone number.' })
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
        if (statusPhoneOtp && statusPhoneOtp.success && statusPhoneOtp.info) {
          this.responseService.sendSuccessResponse(
            res,
            statusPhoneOtp.info,
            statusPhoneOtp.message,
          );
        } else {
          this.responseService.sendForbidden(res, statusPhoneOtp.message);
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

        if (statusEmailOtp && statusEmailOtp.success && statusEmailOtp.info) {
          this.responseService.sendSuccessResponse(
            res,
            statusEmailOtp.info,
            statusEmailOtp.message,
          );
        } else {
          this.responseService.sendForbidden(res, statusEmailOtp.message);
        }
      } else {
        this.logger.warn(`/auth/verifyOtp/=====> Invalid request type.`);
        this.responseService.sendForbidden(res);
      }
    } catch (error) {
      this.logger.error(`/auth/verifyOtp/=====> Catch Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({ summary: 'Verify Referral Code' })
  @Post('/verifyReferralCode')
  async verifyReferralCode(
    @Body() VerifyCode: verifyReferralCodeDto,
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
      if (responseData && responseData.success && responseData.info) {
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
        this.responseService.sendBadRequest(res, responseData.message);
      }
    } catch (error) {
      this.logger.error(
        `/auth/verifyReferralCode/=====> Catch Error : `,
        error,
      );
      this.responseService.sendForbidden(res);
    }
  }

  //TODO RESET PASSWORD WITH LINK - PART 1
  @ApiOperation({ summary: 'Verify Email for Forget Password' })
  @Post('/verifyEmail')
  async verifyEmail(
    @Body() verifyEmail: verifyEmailDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      const language: string = await this.appService.getLanguage(req.headers);
      const responseData = await this.commonService.emailExist(
        verifyEmail.email,
      );
      if (responseData && responseData.status) {
        const resultData = await this.authService.forgetWithEmailOtp(
          verifyEmail.email,
          language,
        );
        this.responseService.sendSuccessResponse(
          res,
          resultData.info,
          resultData.message,
        );
      } else {
        this.responseService.sendSuccessResponse(
          res,
          { isValid: false },
          'user not exist',
        );
      }
    } catch (error) {
      this.responseService.sendForbidden(res);
    }
  }

  //TODO RESET PASSWORD WITH LINK - PART 2
  @ApiOperation({ summary: 'Change New Password Using Reset Password Links.' })
  @Post('/changePassword')
  async changePassword(
    @Body() changePassword: changePasswordDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const passwordChanged = await this.authService.changePassword(
        changePassword,
      );
      if (passwordChanged) {
        this.responseService.sendSuccessResponse(
          res,
          { status: passwordChanged.status },
          passwordChanged.message,
        );
      } else {
        this.responseService.sendBadRequest(res);
      }
    } catch (error) {
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({ summary: 'Please signup here for only client.' })
  @Post('/signup')
  async SignUp(
    @Body() SignUpBody: SignUpDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      const language = await this.appService.getLanguage(req.headers);
      const data = await this.authService.signUp(
        language,
        SignUpBody,
        req.headers,
      );

      if (data.success === true) {
        this.responseService.sendSuccessResponse(
          res,
          data.info.user,
          data.info.message,
        );
      } else {
        this.responseService.sendBadRequest(res, data.message);
      }
    } catch (error) {
      console.log(error);

      this.responseService.sendBadRequest(res);
    }
  }

  @ApiOperation({ summary: 'Please signup here for only client.' })
  @Post('/sign-up-interpreter')
  async SignUpInterpreter(
    @Body() SignUpBody: SignUpInterpreterDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      const language = await this.appService.getLanguage(req.headers);
      const data = await this.authService.signUpInterpreter(
        language,
        SignUpBody,
        req.headers,
      );

      if (data && data.success === true) {
        this.responseService.sendSuccessResponse(
          res,
          data.info.user,
          data.info.message,
        );
      } else {
        this.responseService.sendBadRequest(res);
      }
    } catch (error) {
      console.log(error);

      this.responseService.sendBadRequest(res);
    }
  }

  @ApiOperation({ summary: 'Please Login here.' })
  @Post('/login')
  async Login(
    @Body() loginBody: LogInDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      console.log(loginBody);
      const language: string = await this.appService.getLanguage(req.headers);

      const data = await this.authService.LoginServices(
        loginBody,
        req.headers,
        language,
      );
      if (data.success === true) {
        this.responseService.sendSuccessResponse(
          res,
          data?.info.user,
          data.message,
        );
      } else {
        this.responseService.sendBadRequest(res, data.message);
      }
    } catch (error) {
      console.log(error);
      this.responseService.sendBadRequest(res);
    }
  }

  @ApiOperation({ summary: 'Social Signup' })
  @Post('/socialSignup')
  async socialSignup(
    @Body() socialSignup: socialSignupDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const { email, social_id, social_type } = socialSignup;
      const query: any = {};

      query.$or = [
        email ? { email } : null,
        social_id ? { social: { $elemMatch: { id: social_id } } } : null,
        social_type ? { social: { $elemMatch: { type: social_type } } } : null,
      ].filter(Boolean);

      const resultData = await this.commonService.userDetail(query);
      if (resultData) {
        this.responseService.sendSuccessResponse(res, {
          isExist: true,
          userData: resultData,
        });
      } else {
        this.responseService.sendSuccessResponse(res, {
          isExist: false,
          userData: {},
        });
      }
    } catch (error) {
      this.responseService.sendForbidden(res);
    }
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Data Collection And Analysis User GET AND Update data',
  })
  @Post('/dataCollectionAndAnalysis')
  async dataCollectionAndAnalysisFetchAndUpdate(
    @Body() dataCollections: dataCollectionsUpdateDto,
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
      this.logger.log(`/auth/dataCollectionAndAnalysis/=====> Result : `, data);

      if (data && data.success && data.info) {
        this.responseService.sendSuccessResponse(res, data.info, data.message);
      } else {
        this.logger.log(
          `/auth/dataCollectionAndAnalysis/=====> Invalid Request !! `,
          data.message,
        );
        this.responseService.sendBadRequest(res, data.message);
      }
    } catch (error) {
      this.logger.error(
        `/auth/dataCollectionAndAnalysis/=====> Catch C Error : `,
        error,
      );
      this.responseService.sendForbidden(res);
    }
  }
}
