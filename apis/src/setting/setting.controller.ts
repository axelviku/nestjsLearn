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
import { Request, Response } from 'express';
import { CustomHeaders } from 'common/decorators/customHeaders.decorator';
import { GlobalI18nValidationPipe } from '../../../common/global-validation.pipe';
import { AuthGuard } from 'common/guards/auth-guard';
import { AppService } from '../app.service';
import { ResponseService } from 'common/services/response.service';
import { I18nService, I18nLang } from 'nestjs-i18n';
import { MyLogger } from '../my-logger.service';
import { SettingService } from './setting.service';
import {
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

import { constant } from 'common/constant/constant';
import { Currency } from 'common/schemas/currency.schema';
import {
  languageCoverageDataDto,
  updateDevicePermissionDataDto,
  updatePreferredCurrencyDataDto,
  sendInquiryReportDataDto,
} from './setting.dto';

@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('Setting')
@CustomHeaders()
@UsePipes(GlobalI18nValidationPipe)
@Controller('setting')
export class SettingController {
  constructor(
    private readonly responseService: ResponseService,
    private readonly logger: MyLogger,
    private readonly settingService: SettingService,
  ) {}

  @ApiOperation({
    summary: 'Update User Device Permissission Settings.',
  })
  @Post('/updateDevicePermission')
  async updateUserDevicePermission(
    @Body() updateDevicePermissionData: updateDevicePermissionDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/setting/updateDevicePermission/=====>`);
      const { _id, appLanguage } = req['userData'];
      this.logger.log(`/setting/updateDevicePermission/=====> Login Data :  `);
      this.logger.log(
        `/setting/updateDevicePermission/=====> Request Body : `,
        updateDevicePermissionData,
      );
      if (updateDevicePermissionData.type == constant.POST) {
        const data: any = await this.settingService.userDevicePermission(
          _id,
          updateDevicePermissionData,
          appLanguage,
        );

        if (data && data != null) {
          this.responseService.sendSuccessResponse(
            res,
            data.info,
            data.message,
          );
        } else {
          this.logger.warn(
            `/setting/updateDevicePermission=====> No record found ! `,
          );
          this.responseService.sendForbidden(res);
        }
      } else if (updateDevicePermissionData.type == constant.FETCH) {
        this.logger.log(`/setting/updateDevicePermission=====> type fetch ! `);
        const getData: any = await this.settingService.getDevicePermission(
          _id,
          appLanguage,
        );
        if (getData && getData != null) {
          this.responseService.sendSuccessResponse(
            res,
            getData.info.getPermission,
            getData.message,
          );
        } else {
          this.logger.warn(
            `/setting/updateDevicePermission=====> fetch No record found ! `,
          );
          this.responseService.sendBadRequest(
            res,
            getData.info,
            getData.message,
          );
        }
      } else {
        this.responseService.sendForbidden(res);
      }
    } catch (error) {
      this.logger.error(
        `/setting/updateDevicePermission=====> Catch C Error : `,
        error,
      );
      this.responseService.sendForbidden(res);
    }
  }
  @ApiOperation({
    summary: 'Language Available for interpretation.',
  })
  @Post('/languageCoverage')
  async getLanguageCoverageList(
    @Body() languageCoverageData: languageCoverageDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/setting/languageCoverage/=====>`);
      const { _id, roleId, appLanguage } = req['userData'];
      this.logger.log(
        `/setting/languageCoverage/=====> Login Data :  `,
        req['userdata'],
      );
      this.logger.log(
        `/setting/languageCoverage/=====> Request Body : `,
        languageCoverageData,
      );

      const data: any = await this.settingService.languageCoverage(
        languageCoverageData,
        appLanguage,
      );
      if (data && data != null && data.success === true) {
        this.responseService.sendSuccessResponse(
          res,
          data.info.coverageArr,
          data.message,
        );
      } else {
        this.logger.warn(`/setting/languageCoverage=====> No record found ! `);
        this.responseService.sendBadRequest(
          res,
          data.info.coverageArr,
          data.message,
        );
      }
    } catch (error) {
      this.logger.error(
        `/setting/languageCoverage=====> Catch C Error : `,
        error,
      );
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({
    summary: 'Update User Preferred Currency In Settings.',
  })
  @Post('/updatePreferredCurrency')
  async updatePreferredCurrency(
    @Body() updatePreferredCurrencyData: updatePreferredCurrencyDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/setting/updatePreferredCurrency/=====>`);
      const { _id, appLanguage } = req['userData'];
      this.logger.log(`/setting/updatePreferredCurrency/=====> Login Data :  `);
      this.logger.log(
        `/setting/updatePreferredCurrency/=====>Req body :`,
        updatePreferredCurrencyData,
      );
      const { currencyName } = updatePreferredCurrencyData;
      const data = await this.settingService.preferedCurrency(
        _id,
        currencyName,
        appLanguage,
      );
      if (data && data != null) {
        this.responseService.sendSuccessResponse(res, data.info, data.message);
      } else {
        this.logger.warn(
          `/setting/updatePreferredCurrency=====> No record found ! `,
        );
        this.responseService.sendBadRequest(res, {}, data.message);
      }
    } catch (error) {
      this.logger.error(
        `/setting/updatePreferredCurrency=====> Catch C Error : `,
        error,
      );
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({
    summary: 'Inquiry Feeback and bug report.',
  })
  @Post('/sendInquiry')
  async sendInquiryReport(
    @Body() sendInquiryReportData: sendInquiryReportDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/setting/sendInquiryReport/=====>`);
      const { _id, email, fullName, appLanguage } = req['userData'];
      const deviceInfo: any = req.headers;
      this.logger.log(`/setting/sendInquiryReport/=====> Login Data :  `);
      this.logger.log(
        `/setting/sendInquiryReport/=====> Request Body : `,
        sendInquiryReportData,
      );
      const { message } = sendInquiryReportData;
      const data: any = await this.settingService.inquiryReport(
        { email, fullName, _id },
        deviceInfo,
        message,
        appLanguage,
      );

      if (data && data != null && data.success === true) {
        this.responseService.sendSuccessResponse(res, data.info, data.message);
      } else {
        this.logger.warn(`/setting/sendInquiryReport=====> No record found ! `);
        this.responseService.sendBadRequest(res, {}, data.message);
      }
    } catch (error) {
      this.logger.error(
        `/setting/sendInquiryReport=====> Catch C Error : `,
        error,
      );
      this.responseService.sendForbidden(res);
    }
  }
}
