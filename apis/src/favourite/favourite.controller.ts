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
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomHeaders } from 'common/decorators/customHeaders.decorator';
import { GlobalI18nValidationPipe } from '../../../common/global-validation.pipe';
import { AuthGuard } from 'common/guards/auth-guard';

import { FavouriteService } from './favourite.service';
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
  ApiQuery,
} from '@nestjs/swagger';
import { favouriteDataDto } from './favourite.dto';
import { constant } from 'common/constant/constant';

@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('Favourite')
@CustomHeaders()
@UsePipes(GlobalI18nValidationPipe)
@Controller('favourite')
export class FavouriteController {
  constructor(
    private readonly favouriteService: FavouriteService,
    private readonly responseService: ResponseService,
    private readonly logger: MyLogger,
  ) {}

  @ApiOperation({
    summary: 'List of Favourite Users.',
  })
  @ApiQuery({ name: 'page', type: String, example: '1', required: true })
  @Get('/list')
  async getFavouriteUsersList(
    @Query() allQueryParams: { page?: string },
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/favourite/list/=====>`);
      const { appLanguage, favUsers ,userReferralCode,personalInfo} = req['userData'];
      this.logger.log(`/favourite/list/=====> Login Data :  `);
      this.logger.log(
        `/favourite/list/=====> Request Query : `,
        favUsers,
      );

      const favUserData = await this.favouriteService.getFavUser(
        appLanguage,
        favUsers,
        allQueryParams,
        userReferralCode,
        personalInfo
      );

      if (favUserData && favUserData.success && favUserData.success == true) {
        this.responseService.sendSuccessResponse(
          res,
          favUserData.info.favoriteUserData,
          favUserData.message,
        );
      } else {
        this.logger.warn(`/favourite/list=====> No record found ! `);
        this.responseService.sendBadRequest(
          res,
          favUserData.info.favoriteUserData,
          favUserData.message,
        );
      }
    } catch (error) {
      this.logger.error(`/favourite/list=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({
    summary: 'Add Favourite User.',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    example: '66289a7de7e43d3a52c16e4e',
  })
  @Post('/add/:userId')
  async addFavouriteUserToList(
    @Param() favouriteData: favouriteDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/favourite/add/=====>`);
      const { _id, appLanguage } = req['userData'];
      this.logger.log(`/favourite/add/=====> Login Data :  `, req['userdata']);
      this.logger.log(`/favourite/add/=====> Request Query : `, favouriteData);
      const { userId } = favouriteData;
      const data = await this.favouriteService.addFavorite(
        appLanguage,
        _id,
        userId,
      );

      if (data && data != null) {
        this.responseService.sendSuccessResponse(res, data.info, data.message);
      } else {
        this.logger.warn(`/favourite/add=====> No record found ! `);
        this.responseService.sendBadRequest(res, {}, data.message);
      }
    } catch (error) {
      this.logger.error(`/favourite/add=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({
    summary: 'Remove Favourite User.',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    example: '66289a7de7e43d3a52c16e4e',
  })
  @Post('/remove/:userId')
  async removeFavouriteUserToList(
    @Param() favouriteData: favouriteDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/favourite/remove/=====>`);
      const { _id, appLanguage } = req['userData'];
      this.logger.log(`/favourite/remove/=====> Login Data :  `);
      this.logger.log(
        `/favourite/remove/=====> Request Query : `,
        favouriteData,
      );

      const { userId } = favouriteData;
      const data = await this.favouriteService.removeFavorite(
        appLanguage,
        _id,
        userId,
      );
      if (data && data != null) {
        this.responseService.sendSuccessResponse(res, data.info, data.message);
      } else {
        this.logger.warn(`/favourite/remove=====> No record found ! `);
        this.responseService.sendBadRequest(res, {}, data.message);
      }
    } catch (error) {
      this.logger.error(`/favourite/remove=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }
}
