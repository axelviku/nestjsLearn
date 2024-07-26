import { Request, Response, NextFunction } from 'express';
import {
  CustomHeaders,
  Public,
} from 'common/decorators/customHeaders.decorator';

import { ResponseService } from 'common/services/response.service';
import {
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
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
} from '@nestjs/common';
import { I18nService, I18nLang } from 'nestjs-i18n';
import { generateUrl } from './util.dto';
import { UtilService } from './util.service';

@Controller('util')
@CustomHeaders()
@ApiTags('Util')
export class UtilController {
  constructor(
    private readonly utilService: UtilService,
    private readonly responseService: ResponseService,
    private readonly i18n: I18nService,
  ) {}

  // Create Aws Url For upload documents
  @ApiOperation({ summary: 'Generate upload document url.' })
  @Post('/generate-url')
  async GenerateUrl(
    @Body() generateUrl: generateUrl,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      const result = await this.utilService.sighUpAwsUrl(
        generateUrl.type,
        generateUrl.extention,
      );

      this.responseService.sendSuccessResponse(
        res,
        result,
        this.i18n.t('lang.URL'),
      );
    } catch (error) {
      this.responseService.sendBadRequest(res);
    }
  }
}
