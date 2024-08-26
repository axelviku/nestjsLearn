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
  Query,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CustomHeaders } from 'common/decorators/customHeaders.decorator';
import { GlobalI18nValidationPipe } from '../../../common/global-validation.pipe';
import { AuthGuard } from 'common/guards/auth-guard';

import { UserService } from './user.service';
import { AppService } from '../app.service';
import { ResponseService } from 'common/services/response.service';
import { I18nService, I18nLang } from 'nestjs-i18n';
import { MyLogger } from '../my-logger.service';
import { CommonService } from 'common/utils/common.services';

import {
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { ChangePasswordDto, UserProfileDataDto } from './user.dto';

@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('User')
@CustomHeaders()
@UsePipes(GlobalI18nValidationPipe)
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly responseService: ResponseService,
    private readonly logger: MyLogger,
    private readonly commonService: CommonService,
  ) {}

  @ApiOperation({
    summary: 'Change Password',
  })
  @Post('/changePassword')
  async changePassword(
    @Body() ChangePasswordDto: ChangePasswordDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`user/changePassword/=====>`);
      const { _id, appLanguage } = req['userData'];
      const changeInfo: any = await this.userService.changePassword(
        appLanguage,
        ChangePasswordDto,
        _id,
      );
      if (!changeInfo.status) {
        this.logger.warn(`user/changePassword/=====> No Record Found!`);
        this.responseService.sendBadRequest(res, changeInfo.message);
      }
      this.responseService.sendSuccessResponse(res, {}, changeInfo.message);
    } catch (error) {
      this.logger.error(`user/changePassword/=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({
    summary: 'Get User Profile Detail.',
  })
  @Get('/profileDetail/:userId')
  async getUserProfile(
    @Param() userProfileData: UserProfileDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/user/profileDetail/=====>`);
      this.logger.log(
        `/user/profileDetail/=====> Request Query : `,
        userProfileData,
      );
      const { appLanguage } = req['userData'];
      const data = await this.userService.getUserProfile(
        appLanguage,
        userProfileData,
      );

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

  @ApiOperation({
    summary: 'Delete Account Request From app.',
  })
  @Get('/deleteUserAccountRequest')
  async deleteUserAccountRequest(
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/user/deleteUserAccountRequest/=====>`);
      const { _id, appLanguage } = req['userData'];
      const data: any = await this.userService.deleteAccountRequest(
        appLanguage,
        _id,
      );

      if (data && data.success == true) {
        this.responseService.sendSuccessResponse(res, data.info, data.message);
      } else {
        this.logger.warn(
          `/user/deleteUserAccountRequest=====> No record found ! `,
        );
        this.responseService.sendBadRequest(res, data.info, data.message);
      }
    } catch (error) {
      this.logger.error(
        `/user/deleteUserAccountRequest=====> Catch C Error : `,
        error,
      );
      this.responseService.sendForbidden(res);
    }
  }
}
