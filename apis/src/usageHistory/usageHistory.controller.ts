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

import { UsageHistoryService } from './usageHistory.service';
import { AppService } from '../app.service';
import { ResponseService } from 'common/services/response.service';
import { I18nService, I18nLang } from 'nestjs-i18n';
import { MyLogger } from '../my-logger.service';
import {
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('Usage History')
@CustomHeaders()
@UsePipes(GlobalI18nValidationPipe)
@Controller('usageHistory')
export class UsageHistoryController {
  constructor(
    private readonly usageHistoryService: UsageHistoryService,
    private readonly responseService: ResponseService,
    private readonly logger: MyLogger,
  ) {}

  @ApiOperation({
    summary: 'Earning History of User',
  })
  @Get('/earningHistory')
  async earningHistory(
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/usageHistory/earningHistory/=====>`);
      const { _id, roleId, appLanguage } = req['userData'];
      this.logger.log(
        `/usageHistory/earningHistory/=====> Login Data :  `,
        req['userdata'],
      );

      const data = {};

      if (data && data != null) {
        this.responseService.sendSuccessResponse(
          res,
          {},
          'Records fetched successfully !!',
        );
      } else {
        this.logger.warn(
          `/usageHistory/earningHistory=====> No record found ! `,
        );
        this.responseService.sendForbidden(res);
      }
    } catch (error) {
      this.logger.error(
        `/usageHistory/earningHistory=====> Catch C Error : `,
        error,
      );
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({
    summary: 'Cashout History of User',
  })
  @Get('/cashoutHistory')
  async cashoutHistory(
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/usageHistory/cashoutHistory/=====>`);
      const { _id, roleId, appLanguage } = req['userData'];
      this.logger.log(
        `/usageHistory/cashoutHistory/=====> Login Data :  `,
        req['userdata'],
      );

      const data = {};

      if (data && data != null) {
        this.responseService.sendSuccessResponse(
          res,
          {},
          'Records fetched successfully !!',
        );
      } else {
        this.logger.warn(
          `/usageHistory/cashoutHistory=====> No record found ! `,
        );
        this.responseService.sendForbidden(res);
      }
    } catch (error) {
      this.logger.error(
        `/usageHistory/cashoutHistory=====> Catch C Error : `,
        error,
      );
      this.responseService.sendForbidden(res);
    }
  }
}
