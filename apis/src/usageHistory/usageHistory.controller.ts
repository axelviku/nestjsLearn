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
import { UsageHistoryDataDto } from './usageHistory.dto';
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
    summary: 'Export Call Logs History with Filters.',
  })
  @Post('/exportCallLogsWithFilters')
  async exportCallLogsWithFilters(
    @Body() usageHistoryData: UsageHistoryDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/usageHistory/exportCallLogsWithFilters/=====>`);
      const { _id, roleId, appLanguage } = req['userData'];
      this.logger.log(
        `/usageHistory/exportCallLogsWithFilters/=====> Login Data :  `,
        req['userdata'],
      );
      this.logger.log(
        `/usageHistory/exportCallLogsWithFilters/=====> Request Body : `,
        usageHistoryData,
      );

      const data = {};
      if (data && data != null) {
        this.responseService.sendSuccessResponse(
          res,
          {},
          'Records exported successfully !!',
        );
      } else {
        this.logger.warn(
          `/usageHistory/exportCallLogsWithFilters=====> No record found ! `,
        );
        this.responseService.sendForbidden(res);
      }
    } catch (error) {
      this.logger.error(
        `/usageHistory/exportCallLogsWithFilters=====> Catch C Error : `,
        error,
      );
      this.responseService.sendForbidden(res);
    }
  }
}
