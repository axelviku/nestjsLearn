import {
  Controller,
  Get,
  Res,
  Req,
  UsePipes,
  Version,
  Param,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomHeaders } from 'common/decorators/customHeaders.decorator';
import { GlobalI18nValidationPipe } from '../../../common/global-validation.pipe';

import { ResponseService } from 'common/services/response.service';
import { ResourcesService } from './resources.service';
import { AppService } from '../app.service';
import { MyLogger } from '../my-logger.service';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CountryIdDto } from './resources.dto';

@ApiTags('Resources')
@CustomHeaders()
@UsePipes(GlobalI18nValidationPipe)
@Controller('resources')
export class ResourcesController {
  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly responseService: ResponseService,
    private readonly appService: AppService,
    private readonly logger: MyLogger,
  ) {}
  @Version('1.0')
  @ApiOperation({ summary: 'List of Countries with country code and flag.' })
  @UsePipes(GlobalI18nValidationPipe)
  @Get('/country')
  async getCountry(@Res() res: Response, @Req() req: Request) {
    try {
      const language: string = await this.appService.getLanguage(req.headers);
      this.logger.log(`/resources/country/=====>`);
      const data: any = await this.resourcesService.getCountryList(language);
      if (data && data.success && data.info) {
        this.responseService.sendSuccessResponse(
          res,
          data.info.country,
          data.message,
        );
      } else {
        this.logger.warn(
          `/resources/country/=====> No Record Found!`,
          data.message,
        );
        this.responseService.sendBadRequest(res, data.message);
      }
    } catch (error) {
      this.logger.error(`/resources/country/=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({ summary: 'List of Cities for a particular country. ' })
  @ApiParam({
    name: 'countryId',
    type: 'string',
    required: true,
    description: 'country id whose list of cities we want to fetch.',
    example: '66289a7de7e43d3a52c16e4e',
  })
  @Get('/cities/:countryId')
  async getCity(
    @Param() countryData: CountryIdDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      this.logger.log(`/resources/cities/:countryId=====>`);
      const { countryId } = countryData;
      const language: string = await this.appService.getLanguage(req.headers);
      const data: any = await this.resourcesService.getCityListForCountryId(
        language,
        countryId,
      );
      if (data && data.success && data.info) {
        this.responseService.sendSuccessResponse(
          res,
          data.info.city,
          data.message,
        );
      } else {
        this.logger.warn(
          `/resources/country/=====> No Record Found!`,
          data.message,
        );
        this.responseService.sendBadRequest(res, data.message);
      }
    } catch (error) {
      this.logger.error(`/resources/country/=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({ summary: 'List of Expertise.' })
  @Get('/expertise')
  async getExpertise(@Res() res: Response, @Req() req: Request) {
    try {
      this.logger.log(`/resources/expertise/=====>`);
      const language: string = await this.appService.getLanguage(req.headers);
      const data: any = await this.resourcesService.getExpertiseList(language);
      if (data && data.success && data.info) {
        this.responseService.sendSuccessResponse(
          res,
          data.info.expertise,
          data.message,
        );
      } else {
        this.logger.warn(
          `/resources/expertise/=====> No Record Found!`,
          data.message,
        );
        this.responseService.sendBadRequest(res, data.message);
      }
    } catch (error) {
      this.logger.error(`/resources/expertise/=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({ summary: 'List of Languages.' })
  @Get('/language')
  async getLanguage(@Res() res: Response, @Req() req: Request) {
    try {
      this.logger.log(`/resources/language/=====>`);
      const language: string = await this.appService.getLanguage(req.headers);
      const data: any = await this.resourcesService.getLanguageList(language);
      if (data && data.success && data.info) {
        this.responseService.sendSuccessResponse(
          res,
          data.info.language,
          data.message,
        );
      } else {
        this.logger.warn(
          `/resources/language/=====> No Record Found!`,
          data.message,
        );
        this.responseService.sendBadRequest(res, data.message);
      }
    } catch (error) {
      this.logger.error(`/resources/language/=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({ summary: 'List of Currency.' })
  @Get('/currency')
  async getCurrency(@Res() res: Response, @Req() req: Request) {
    try {
      this.logger.log(`/resources/currency/=====>`);
      const language: string = await this.appService.getLanguage(req.headers);
      const data: any = await this.resourcesService.getCurrencyList(language);
      if (data && data.success && data.info) {
        this.responseService.sendSuccessResponse(
          res,
          data.info.currency,
          data.message,
        );
      } else {
        this.logger.warn(
          `/resources/currency/=====> No Record Found!`,
          data.message,
        );
        this.responseService.sendBadRequest(res, data.message);
      }
    } catch (error) {
      this.logger.error(`/resources/currency/=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({ summary: 'List of Prefecture' })
  @Get('/prefecture')
  async prefecture(@Res() res: Response, @Req() req: Request): Promise<void> {
    try {
      this.logger.log(`/resources/prefecture/=====>`);
      const language: string = await this.appService.getLanguage(req.headers);
      const data: any = await this.resourcesService.getPrefectureList(language);
      if (data && data.success && data.info) {
        this.responseService.sendSuccessResponse(res, data.info, data.message);
      } else {
        this.logger.warn(
          `/resources/prefecture/=====> No Record Found!`,
          data.message,
        );
        this.responseService.sendBadRequest(res, data.message);
      }
    } catch (error) {
      this.logger.error(`/resources/prefecture/=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }
}
