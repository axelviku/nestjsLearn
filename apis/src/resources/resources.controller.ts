import { Body, Controller, Get, Post, Res, Req, UsePipes, Next, UseGuards, Put } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomHeaders, Public } from 'common/decorators/customHeaders.decorator';
import { GlobalI18nValidationPipe } from '../../../common/global-validation.pipe'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ResponseService } from 'common/services/response.service';
import { ResourcesService } from './resources.service';
import { AppService } from '../app.service';
import { UtilityService } from 'common/utils/utils.service';
import { User } from 'common/schemas/user.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AuthGuard } from 'common/guards/auth-guard';
import { I18nService, I18nLang } from 'nestjs-i18n';



@ApiTags("Resources")
@CustomHeaders()
@Controller('resources')
export class ResourcesController {
    constructor(
        private readonly userService: ResourcesService,
        private readonly responseService: ResponseService,
        private readonly appService: AppService,
        private readonly i18n: I18nService
        @InjectModel(User.name) private readonly userModel: Model<User>,
      ) {}

      @ApiOperation({ summary: 'Country Details' })
      @Get('/getCountry')
      async getCountry(
        @Res() res: Response,
        @Req() req: Request,
      ): Promise<void> {
        
        const language = await this.appService.getLanguage(req.headers);
     
        const data:any   = await this.userService.countryFind(language);
      
        if (data.success) {
        this.responseService.sendSuccessResponse(res, data.info.country,this.i18n.t('validation.Test', { lang : language}) )
        } else {
          this.responseService.sendBadRequest(res,data.message)
        }
      }
    
      @ApiOperation({ summary: 'City Details' })
      @ApiParam({ name: 'countryId', type: 'string', required: true, description: 'country id', example: '66289a7de7e43d3a52c16e4e' })
      @UseGuards(AuthGuard)
      @ApiBearerAuth('JWT-auth')
      @Get('/getCity/:countryId')
      async getCity(
        @Res() res: Response,
        @Req() req: Request,
      ): Promise<void> {
        const countryId:string = req.params.countryId;
        const language = await this.appService.getLanguage(req.headers)
     
        const data:any   = await this.userService.cityFind(language,countryId)
      
        if (data.success) {
          this.responseService.sendSuccessResponse(res, data.info.city, data.message)
        } else {
          this.responseService.sendBadRequest(res,data.message)
        }
      }
}
