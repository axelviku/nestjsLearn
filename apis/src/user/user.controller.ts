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
import {
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { ChangePasswordDto, UserProfileDataDto } from './user.dto';

@ApiTags('User')
@CustomHeaders()
@UsePipes(GlobalI18nValidationPipe)
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly responseService: ResponseService,
    private readonly logger: MyLogger,
  ) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
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

      const data = {
        userProfileData: {
          fullName: 'Tim Cook',
          _id: '66289a7de7e43d3a52c16e4e',
          roleId: '59a3c559891d70748ead0e74',
          gender: 'female',
          photo: '',
          isOnline: true,
          languages: [
            {
              _id: '59a3c559891d70748ead0e74',
              name: 'Spanish',
              type: 'native',
            },
            {
              _id: '59a3c559891d70748ead0e75',
              name: 'English',
              type: 'native',
            },
          ],
          profileDetails: 'Hello Profile',
          countryId: {
            _id: '59ca2eb54c5b0874203b766a',
            name: 'Spain',
          },
          cityId: {
            _id: '59c8ba74c0d97628bf7fec68',
            name: 'Albacete',
          },
        },
      };

      if (data && data != null) {
        this.responseService.sendSuccessResponse(
          res,
          data,
          'Record fetch success !!',
        );
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
